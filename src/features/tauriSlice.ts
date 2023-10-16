import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../app/store';
import { arch, OsType, Platform, platform, type } from '@tauri-apps/api/os';
import { getVersion } from '@tauri-apps/api/app';

interface TauriState {
  os: {
    arch: string,
    platform: Platform,
    type: OsType,
  } | null,
  app: {
    version: string,
  } | null
}

const initialState: TauriState = {
  os: null,
  app: null,
};

export const tauriSlice = createSlice({
  name: 'tauri',
  initialState,
  reducers: {
    setOs: (state, action: PayloadAction<TauriState['os']>) => {
      state.os = action.payload;
    },
    setApp: (state, action: PayloadAction<TauriState['app']>) => {
      state.app = action.payload;
    },
  },
});

type InitializeTauriStateError =
  | {
    kind: "ApiFailed";
    [k: string]: unknown;
  }

export const initializeTauriState = createAsyncThunk<void, void, { state: RootState, rejectValue: InitializeTauriStateError }>(`${tauriSlice.name}/initializeTauriState`, async (_, { rejectWithValue, dispatch }) => {
  try {
    const osArch = await arch();
    const osPlatform = await platform();
    const osType = await type();

    const appVersion = await getVersion();

    dispatch(setOs({
      arch: osArch,
      platform: osPlatform,
      type: osType,
    }));
    dispatch(setApp({
      version: appVersion,
    }));
  } catch (e) {
    return rejectWithValue({
      kind: "ApiFailed",
      error: e,
    })
  }
})

export const { setOs, setApp } = tauriSlice.actions;
export default tauriSlice.reducer
