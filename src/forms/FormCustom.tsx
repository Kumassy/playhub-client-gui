import React, { useState } from 'react';
import { killChild, runChecksAndLaunchLocal } from '../features/localSlice';
import { useAppSelector, useAppDispatch } from '../app/hooks';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import AutoScroll from '@brianmcallister/react-auto-scroll';
import { Checkbox, Collapse, FormControlLabel, InputLabel, MenuItem, Select, SelectChangeEvent, Tooltip } from '@mui/material';
import { Protocol } from '../common';
import { useTranslation } from 'react-i18next';
import { FormProps } from '../types';
import { OperationButton, ResultChip } from '../utils';
import { updateCommand, updateLocalPort, updateProtocol } from '../features/reducers/games/custom';

export const FormCustom: React.FC<FormProps> = ({ handleBack, handleNext }) => {
  const localMessages = useAppSelector(state => state.local.messages)
  const localPort = useAppSelector(state => state.local.config.custom.endpoints[0].port)
  const localStatus = useAppSelector(state => state.local.status)
  const checks = useAppSelector(state => state.local.checks)
  const command = useAppSelector(state => state.local.config.custom.command)
  const protocol = useAppSelector(state => state.local.config.custom.endpoints[0].protocol)
  const { t } = useTranslation();
  const dispatch = useAppDispatch()

  const [useLocalFeature, setUseLocalFeature] = useState(false);

  const isBackDisabled = localStatus === 'running'
  const isNextDisabled = (useLocalFeature && localStatus !== 'running')
  return (
    <React.Fragment>
      <Box
        component="form"
        sx={{
          '& .MuiTextField-root': { marginBottom: 1 },
        }}
      >
        <Typography sx={{ mb: 2 }} variant="h6" component="div">
          {t('panel.startServer.steps.launchLocalServer.custom.settings.label')}
        </Typography>

        <TextField
          fullWidth
          id="local-port"
          label={t('panel.startServer.steps.launchLocalServer.custom.settings.port')}
          type="number"
          variant="outlined"
          onChange={e => dispatch(updateLocalPort({key: 'main', port: parseInt(e.target.value)}))}
          value={localPort}
        />

        <Box>
          <InputLabel id="select-protocol-label">{t('panel.startServer.steps.launchLocalServer.custom.settings.protocol.label')}</InputLabel>
          <Select
            labelId="select-protocol-label"
            id="select-protocol"
            value={protocol}
            label={t('panel.startServer.steps.launchLocalServer.custom.settings.protocol.label')}
            onChange={(e: SelectChangeEvent<Protocol>) => dispatch(updateProtocol({key: 'main', protocol: e.target.value as Protocol}))}
          >
            <MenuItem value={'TCP'}>{t('panel.startServer.steps.launchLocalServer.custom.settings.protocol.tcp')}</MenuItem>
            <MenuItem value={'UDP'}>{t('panel.startServer.steps.launchLocalServer.custom.settings.protocol.udp')}</MenuItem>
          </Select>
        </Box>

        <FormControlLabel
          control={
            <Checkbox
              checked={useLocalFeature}
              onChange={() => setUseLocalFeature(!useLocalFeature)}
              name="useLocalFeature"
            />
          }
          label={t('panel.startServer.steps.launchLocalServer.custom.settings.useLocalFeature')}
        />

        <Collapse in={useLocalFeature}>
          <TextField
            fullWidth
            id="local-server-command"
            label={t('panel.startServer.steps.launchLocalServer.custom.settings.command')}
            variant="outlined"
            onChange={e => dispatch(updateCommand(e.target.value))}
            value={command ? command : ''}
          />

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12}>
              <Typography sx={{ mt: 4, mb: 2 }} variant="h6" component="div">
                {t('panel.startServer.steps.launchLocalServer.custom.tasks.label')}
              </Typography>

              {checks.map(check => {
                return (
                  <Accordion key={check.id}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                    >
                      <Typography>{t(`panel.startServer.checks.${check.label}`)} <ResultChip status={check.status} /></Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography>
                        {check.message}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                )
              })}

              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                >
                  <Typography>{t('panel.startServer.steps.launchLocalServer.custom.tasks.start')} <ResultChip status={localStatus} /></Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <AutoScroll
                    showOption={false}
                    height={100}
                  >
                    {localMessages.map(msg => {
                      return (
                        <div key={msg.key}>
                          {msg.message}
                        </div>
                      );
                    })}
                  </AutoScroll>
                </AccordionDetails>
              </Accordion>
            </Grid>
          </Grid>

          <Grid
            container
            direction="column"
            justifyContent="center"
            alignItems="center"
          >
            <Grid item xs={12}>
              <OperationButton
                status={localStatus}
                launch={runChecksAndLaunchLocal}
                interrupt={killChild}
              />
            </Grid>
          </Grid>
        </Collapse>

      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
        <Tooltip title={isBackDisabled ? t('panel.startServer.steps.launchLocalServer.custom.control.backDesc'): ""}>
          <span>
            <Button
              color="inherit"
              disabled={isBackDisabled}
              onClick={handleBack}
            >
              {t('common.control.back')}
            </Button>
          </span>
        </Tooltip>
        <Box sx={{ flex: '1 1 auto' }} />

        <Tooltip title={isNextDisabled ? t('panel.startServer.steps.launchLocalServer.custom.control.nextDesc'): ""}>
          <span>
            <Button
              onClick={handleNext}
              disabled={isNextDisabled}
            >
              {t('common.control.next')}
            </Button>
          </span>
        </Tooltip>
      </Box>
    </React.Fragment>
  )
}
