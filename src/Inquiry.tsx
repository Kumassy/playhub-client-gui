import { useEffect } from 'react'
import { open } from '@tauri-apps/api/shell';
import { useAppDispatch, useAppSelector } from './app/hooks'
import { GameId } from "./common"
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import { Button, ButtonGroup,  Grid,  Link, Typography } from '@mui/material'
import { initEnv } from './features/envSlice';


const ENTRY_GAME = 'entry.665497736'
const ENTRY_OS = 'entry.581420414'
const ENTRY_APP_TYPE = 'entry.1310045396'
const ENTRY_APP_VERSION = 'entry.522632759'
const ENTRY_LOG = 'entry.2057541863'


const getGameName = (game: GameId) => {
  switch (game) {
    case 'minecraft':
      return 'Minecraft Java Edition'
    case 'minecraft_be':
      return 'Minecraft Bedrock Edition'
    case 'minecraft_forge':
      return 'Minecraft Forge'
    case 'factorio':
      return 'factorio'
    default:
      return 'その他'
  }
}

export enum AppType {
  GUI = 'デスクトップアプリ, GUI',
  CLI = 'コマンド, CLI',
}

export const constructUrl = (gameId: GameId, os: string, appType: AppType, appVersion: string, log: string) => {
  return `https://docs.google.com/forms/d/e/1FAIpQLSekB3eFJBI3bEscx1y9FjIEEVzA6hAchlAO55EKZIhbEMvFSQ/viewform?usp=pp_url&${ENTRY_GAME}=${encodeURI(getGameName(gameId))}&${ENTRY_OS}=${encodeURI(os)}&${ENTRY_APP_TYPE}=${encodeURI(appType)}&${ENTRY_APP_VERSION}=${encodeURI(appVersion)}&${ENTRY_LOG}=${encodeURI(log)}`
}


function Inquiry() {
  const dispatch = useAppDispatch()
  const { t } = useTranslation();

  const env = useAppSelector(state => state.env)
  const game = useAppSelector(state => state.local.game)
  const local = useAppSelector(state => state.local)
  const tunnel = useAppSelector(state => state.tunnel)

  useEffect(() => {
    dispatch(initEnv());
  }, [dispatch])

  const handleFormButtonClick = async () => {
    const { os, app } = env;
    if (!os || !app) {
      return;
    }
    const url = constructUrl(
      game,
      `OS: ${os.type} Platform: ${os.platform} Arch: ${os.arch} Version: ${os.version}`,
      AppType.GUI,
      `App: ${app.appVersion} Tauri: ${app.tauriVersion}`,
      JSON.stringify({ local, tunnel })
    );
    await open(url);
  }

  return (
    <Box sx={{ flexGrow: 1, padding: 2, display: 'flex', justifyContent: 'space-between', flexDirection: 'column'}}>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12}>
          <Typography sx={{ mb: 2 }} variant="h6" component="div">
            {t('panel.inquiry.title')}
          </Typography>
        </Grid>
        <Grid item xs={12} sx={{ mb: 2 }}>
          <Typography>{t('panel.inquiry.description1')}</Typography>
          <Typography>{t('panel.inquiry.description2')}</Typography>
          <Link href="https://ownserver.kumassy.com/inquiry" target="_blank">
            {t('panel.inquiry.linkText')}
          </Link>
        </Grid>
        <Grid item xs={12} sx={{ mb: 2 }}>
          <ButtonGroup
            orientation="vertical"
            aria-label="Vertical button group"
            variant="contained"
          >
            <Button variant="contained" onClick={handleFormButtonClick}>
              {t('panel.inquiry.formButtonText')}
            </Button>
            <Button variant="contained" href="https://marshmallow-qa.com/ownserver?utm_medium=url_text&utm_source=promotion" target="_blank">
              {t('panel.inquiry.mashmallowButtonText')}
            </Button>
          </ButtonGroup>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Inquiry
