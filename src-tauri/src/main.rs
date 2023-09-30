#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod data;
use std::path::Path;

use crate::data::{
    LaunchResult,
    LaunchResultError,
};
use data::CreateEulaError;
use tauri::Manager;
use log::*;
use ownserver::{proxy_client::run, error::Error};
use ownserver_lib::{Protocol, EndpointClaim};
use tokio::{fs, task::JoinSet};
use tokio_util::sync::CancellationToken;

const EULA_CONTENT: &str = r#"
#By changing the setting below to TRUE you are indicating your agreement to our EULA (https://account.mojang.com/documents/minecraft_eula).
eula=true
"#;

async fn collect_join_set(mut set: JoinSet<Result<(), Error>>) -> Result<(), LaunchResultError> {
    while let Some(res) = set.join_next().await {
        match res {
            Err(e) => {
                error!("join error {:?} for client", e);
                return Err(LaunchResultError::InternalClientError{ message: e.to_string()})
            }
            Ok(Err(e)) => {
                error!("client exited. reason: {:?}", e);
                return Err(LaunchResultError::ClientExited{ message: e.to_string()})
            }
            Ok(Ok(_)) => {
                info!("client successfully terminated");
            }
        }
    }
    Ok(())
}


#[tauri::command]
async fn launch_tunnel(window: tauri::Window, token_server: String, local_port: u16, payload: String) -> LaunchResult {
    let cancellation_token = CancellationToken::new();
    let ct = cancellation_token.clone();
    let unlisten = window.once("interrupt_launch_tunnel", move |event| {
        ct.cancel();
    });

    let endpoint_claims = match payload.as_str() {
        "udp" => {
            vec![EndpointClaim {
                protocol: Protocol::UDP,
                local_port,
                remote_port: 0,
            }]
        },
        _ => {
            vec![EndpointClaim {
                protocol: Protocol::TCP,
                local_port,
                remote_port: 0,
            }]
        }
    };
    let store = Default::default();
    let control_port: u16 = 5000;
    // let token_server = "http://localhost:8123/v0/request_token";

    let (client_info, set) =
        match run(store, control_port, &token_server, cancellation_token, endpoint_claims).await {
            Ok(r) => r,
            Err(e) => {
            window.unlisten(unlisten);
            return Err(LaunchResultError::LaunchFailed{ message: e.to_string() });
            }
        };
    info!("client is running under configuration: {:?}", client_info);
    let _ = window.emit_all("update_client_info", client_info);



    let launch_result = collect_join_set(set).await;
    window.unlisten(unlisten);

    debug!("{:?}", launch_result);
    launch_result
}

#[tauri::command]
async fn create_eula(basedir: String) -> Result<(), CreateEulaError> {
    let base = Path::new(&basedir);
    if !base.exists() {
        return Err(CreateEulaError::IoError { message: "basedir does not exist".into() });
    }

    let path = base.join("eula.txt");
    fs::write(path, EULA_CONTENT).await
        .map_err(|e| {
            CreateEulaError::IoError { message: format!("failed to create eula.txt {}", e) }
        })
}

fn main() {
    pretty_env_logger::init();
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            launch_tunnel,
            create_eula,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
