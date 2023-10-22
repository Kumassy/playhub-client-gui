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
import { Checkbox, Collapse, FormControlLabel, InputLabel, MenuItem, Paper, Select, SelectChangeEvent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip } from '@mui/material';
import { Protocol } from '../common';
import { useTranslation } from 'react-i18next';
import { FormProps } from '../types';
import { OperationButton, ResultChip } from '../utils';
import { CUSTOM_STATE_ENDPOINT_DEFAULT_KEY, addEndpoint, removeEndpoint, updateCommand, updateLocalPort, updateProtocol } from '../features/reducers/games/custom';

export const FormCustom: React.FC<FormProps> = ({ handleBack, handleNext }) => {
  const localMessages = useAppSelector(state => state.local.messages)
  const localStatus = useAppSelector(state => state.local.status)
  const checks = useAppSelector(state => state.local.checks)
  const command = useAppSelector(state => state.local.config.custom.command)
  const endpoints = useAppSelector(state => state.local.config.custom.endpoints)
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

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Local Port</TableCell>
                <TableCell>Protocol</TableCell>
                <TableCell>Operation</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {endpoints.map((endpoint) => (
                <TableRow
                  key={endpoint.key}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell>
                    <TextField
                      fullWidth
                      type="number"
                      onChange={e => dispatch(updateLocalPort({key: endpoint.key, port: parseInt(e.target.value)}))}
                      value={endpoint.port}
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={endpoint.protocol}
                      onChange={(e: SelectChangeEvent<Protocol>) => dispatch(updateProtocol({key: endpoint.key, protocol: e.target.value as Protocol}))}
                    >
                      <MenuItem value={'TCP'}>{t('panel.startServer.steps.launchLocalServer.custom.settings.protocol.tcp')}</MenuItem>
                      <MenuItem value={'UDP'}>{t('panel.startServer.steps.launchLocalServer.custom.settings.protocol.udp')}</MenuItem>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button
                      color="inherit"
                      onClick={e => dispatch(removeEndpoint(endpoint.key))}
                      disabled={endpoint.key === CUSTOM_STATE_ENDPOINT_DEFAULT_KEY}
                    >
                      remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={2}>
                </TableCell>
                <TableCell>
                  <Button
                    color="inherit"
                    onClick={e => dispatch(addEndpoint())}
                  >
                    Add
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

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
