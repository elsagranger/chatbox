import React from 'react';
import {
    Button, Alert, Chip,
    Dialog, DialogContent, DialogActions, DialogTitle, TextField,
    FormGroup, FormControlLabel, Switch, Select, MenuItem, FormControl, InputLabel, Slider, Typography, Box,
} from '@mui/material';
import { ModelSetting } from './types'
import { getDefaultSettings } from './store'
import { styled } from '@mui/material/styles';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion';
import MuiAccordionSummary, { AccordionSummaryProps } from '@mui/material/AccordionSummary';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import { useTranslation } from 'react-i18next'
import PlaylistAddCheckCircleIcon from '@mui/icons-material/PlaylistAddCheckCircle';
import LightbulbCircleIcon from '@mui/icons-material/LightbulbCircle';
import { getModels } from './client';


const { useEffect } = React

interface Props {
    open: boolean
    modelSetting: ModelSetting
    close(): void
    save(modelSetting: ModelSetting): void
}

export default function SessionModelSettingWindow(props: Props) {
    const { t } = useTranslation()
    const [settingsEdit, setSettingsEdit] = React.useState<ModelSetting>(props.modelSetting);
    useEffect(() => {
        setSettingsEdit(props.modelSetting)
    }, [props.modelSetting])

    const [availableModels, setAvailableModels] = React.useState<string[]>([])
    useEffect(() => {
        if (props.open) {
            getModels(settingsEdit).then((models) => {
                if (models.length === 0) {
                    return
                }
                setAvailableModels(models)
                if (models.indexOf(settingsEdit.name) === -1) {
                    let firstModel = models[0]
                    setSettingsEdit({ ...settingsEdit, name: firstModel })
                }
            })
        }
    }, [props.open, settingsEdit.apiHost, settingsEdit.apiKey])

    const handleRepliesTokensSliderChange = (event: Event, newValue: number | number[], activeThumb: number) => {
        if (newValue === 8192) {
            setSettingsEdit({ ...settingsEdit, maxTokens: 'inf' });
        } else {
            setSettingsEdit({ ...settingsEdit, maxTokens: newValue.toString() });
        }
    };
    const handleMaxContextSliderChange = (event: Event, newValue: number | number[], activeThumb: number) => {
        if (newValue === 8192) {
            setSettingsEdit({ ...settingsEdit, maxContextSize: 'inf' });
        } else {
            setSettingsEdit({ ...settingsEdit, maxContextSize: newValue.toString() });
        }
    };
    const handleTemperatureChange = (event: Event, newValue: number | number[], activeThumb: number) => {
        if (typeof newValue === 'number') {
            setSettingsEdit({ ...settingsEdit, temperature: newValue });
        } else {
            setSettingsEdit({ ...settingsEdit, temperature: newValue[activeThumb] });
        }
    };
    const handleRepliesTokensInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        if (value === 'inf') {
            setSettingsEdit({ ...settingsEdit, maxTokens: 'inf' });
        } else {
            const numValue = Number(value);
            if (!isNaN(numValue) && numValue >= 0) {
                if (numValue > 8192) {
                    setSettingsEdit({ ...settingsEdit, maxTokens: 'inf' });
                    return;
                }
                setSettingsEdit({ ...settingsEdit, maxTokens: value });
            }
        }
    };
    const handleMaxContextInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        if (value === 'inf') {
            setSettingsEdit({ ...settingsEdit, maxContextSize: 'inf' });
        } else {
            const numValue = Number(value);
            if (!isNaN(numValue) && numValue >= 0) {
                if (numValue > 8192) {
                    setSettingsEdit({ ...settingsEdit, maxContextSize: 'inf' });
                    return;
                }
                setSettingsEdit({ ...settingsEdit, maxContextSize: value });
            }
        }
    };

    const onCancel = () => {
        props.close()
        setSettingsEdit(props.modelSetting)
    }

    // @ts-ignore
    // @ts-ignore
    return (
        <Dialog open={props.open} onClose={onCancel} fullWidth >
            <DialogTitle>{t('per chat settings')}</DialogTitle>
            <DialogContent>
                <TextField
                    margin="dense"
                    label={t('system prompt')}
                    type="text"
                    fullWidth
                    variant="outlined"
                    multiline
                    value={settingsEdit.systemMessage}
                    onChange={(e) => {
                        setSettingsEdit({ ...settingsEdit, systemMessage: e.target.value })
                    }}
                />

                <TextField
                    autoFocus
                    margin="dense"
                    label={t('api key')}
                    type="password"
                    fullWidth
                    variant="outlined"
                    value={settingsEdit.apiKey}
                    onChange={(e) => {
                        setSettingsEdit({ ...settingsEdit, apiKey: e.target.value.trim() })
                    }}
                />
                <TextField
                    margin="dense"
                    label={t('api host')}
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={settingsEdit.apiHost}
                    onChange={(e) => {
                        setSettingsEdit({ ...settingsEdit, apiHost: e.target.value.trim() })
                    }}
                />
                <FormControl fullWidth variant="outlined" margin="dense">
                    <InputLabel htmlFor="model-select">{t('model')}</InputLabel>
                    <Select
                        label="Model"
                        id="model-select"
                        value={(availableModels.indexOf(settingsEdit.name) > -1 ? settingsEdit.name : availableModels[0]) ?? ""}
                        onChange={(e) => {
                            if (e.target.value === undefined) {
                                return
                            }
                            setSettingsEdit({ ...settingsEdit, name: e.target.value })
                        }}>
                        {availableModels.map((model) => (
                            <MenuItem key={model} value={model}>
                                {model}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Accordion>
                    <AccordionSummary
                        aria-controls="panel1a-content"
                    >
                        <Typography>{t('token')} </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Alert severity="warning">
                            {t('settings modify warning')}
                            {t('please make sure you know what you are doing.')}
                            {t('click here to')}
                            <Button onClick={() => setSettingsEdit(getDefaultSettings().modelSetting)}>{t('reset')}</Button>
                            {t('to default values.')}
                        </Alert>
                        <Box sx={{ marginTop: 3, marginBottom: 1 }}>
                            <Typography id="discrete-slider" gutterBottom>
                                {t('temperature')}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                            <Box sx={{ width: '100%' }}>
                                <Slider
                                    value={settingsEdit.temperature}
                                    onChange={handleTemperatureChange}
                                    aria-labelledby="discrete-slider"
                                    valueLabelDisplay="auto"
                                    defaultValue={settingsEdit.temperature}
                                    step={0.1}
                                    min={0}
                                    max={1}
                                    marks={[
                                        {
                                            value: 0.2,
                                            label: <Chip size='small' icon={<PlaylistAddCheckCircleIcon />} label={t('meticulous')} />
                                        },
                                        {
                                            value: 0.8,
                                            label: <Chip size='small' icon={<LightbulbCircleIcon />} label={t('creative')} />
                                        },
                                    ]}
                                />
                            </Box>
                        </Box>

                        <Box sx={{ marginTop: 3, marginBottom: -1 }}>
                            <Typography id="discrete-slider" gutterBottom>
                                {t('max tokens in context')}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                            <Box sx={{ width: '92%' }}>
                                <Slider
                                    value={settingsEdit.maxContextSize === 'inf' ? 8192 : Number(settingsEdit.maxContextSize)}
                                    onChange={handleMaxContextSliderChange}
                                    aria-labelledby="discrete-slider"
                                    valueLabelDisplay="auto"
                                    defaultValue={settingsEdit.maxContextSize === 'inf' ? 8192 : Number(settingsEdit.maxContextSize)}
                                    step={64}
                                    min={64}
                                    max={8192}
                                />
                            </Box>
                            <TextField
                                sx={{ marginLeft: 2 }}
                                value={settingsEdit.maxContextSize}
                                onChange={handleMaxContextInputChange}
                                type="text"
                                size="small"
                                variant="outlined"
                            />
                        </Box>

                        <Box sx={{ marginTop: 3, marginBottom: -1 }}>
                            <Typography id="discrete-slider" gutterBottom>
                                {t('max tokens per reply')}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                            <Box sx={{ width: '92%' }}>
                                <Slider
                                    value={settingsEdit.maxTokens === 'inf' ? 8192 : Number(settingsEdit.maxTokens)}
                                    defaultValue={settingsEdit.maxTokens === 'inf' ? 8192 : Number(settingsEdit.maxTokens)}
                                    onChange={handleRepliesTokensSliderChange}
                                    aria-labelledby="discrete-slider"
                                    valueLabelDisplay="auto"
                                    step={64}
                                    min={64}
                                    max={8192}
                                />
                            </Box>
                            <TextField
                                sx={{ marginLeft: 2 }}
                                value={settingsEdit.maxTokens}
                                onChange={handleRepliesTokensInputChange}
                                type="text"
                                size="small"
                                variant="outlined"
                            />
                        </Box>
                    </AccordionDetails>
                </Accordion>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancel}>{t('cancel')}</Button>
                <Button onClick={() => props.save(settingsEdit)}>{t('save')}</Button>
            </DialogActions>
        </Dialog>
    );
}

const Accordion = styled((props: AccordionProps) => (
    <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
    '&:not(:last-child)': {
        borderBottom: 0,
    },
    '&:before': {
        display: 'none',
    },
}));

const AccordionSummary = styled((props: AccordionSummaryProps) => (
    <MuiAccordionSummary
        expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: '0.9rem' }} />}
        {...props}
    />
))(({ theme }) => ({
    backgroundColor:
        theme.palette.mode === 'dark'
            ? 'rgba(255, 255, 255, .05)'
            : 'rgba(0, 0, 0, .03)',
    flexDirection: 'row-reverse',
    '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
        transform: 'rotate(90deg)',
    },
    '& .MuiAccordionSummary-content': {
        marginLeft: theme.spacing(1),
    },
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
    padding: theme.spacing(2),
    borderTop: '1px solid rgba(0, 0, 0, .125)',
}));
