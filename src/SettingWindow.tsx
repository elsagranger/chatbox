import React from 'react';
import {
    Button, Alert, Chip,
    Dialog, DialogContent, DialogActions, DialogTitle, TextField,
    FormGroup, FormControlLabel, Switch, Select, MenuItem, FormControl, InputLabel, Slider, Typography, Box,
} from '@mui/material';
import { GPTModels, Settings } from './types'
import { getDefaultSettings } from './store'
import ThemeChangeButton from './theme/ThemeChangeIcon';
import { ThemeMode } from './theme/index';
import { useThemeSwicher } from './theme/ThemeSwitcher';
import { styled } from '@mui/material/styles';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion';
import MuiAccordionSummary, { AccordionSummaryProps } from '@mui/material/AccordionSummary';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import { Trans, useTranslation } from 'react-i18next'
import PlaylistAddCheckCircleIcon from '@mui/icons-material/PlaylistAddCheckCircle';
import LightbulbCircleIcon from '@mui/icons-material/LightbulbCircle';

const { useEffect } = React
const languages: string[] = ['en', 'zh-Hans', 'zh-Hant', 'jp'];
const languageMap: { [key: string]: string } = {
    'en': 'English',
    'zh-Hans': '简体中文',
    'zh-Hant': '繁體中文',
    'jp': '日本語'
};
interface Props {
    open: boolean
    settings: Settings
    close(): void
    save(settings: Settings): void
}

export default function SettingWindow(props: Props) {
    const { t } = useTranslation()
    const [settingsEdit, setSettingsEdit] = React.useState<Settings>(props.settings);
    const handleRepliesTokensSliderChange = (event: Event, newValue: number | number[], activeThumb: number) => {
        let model = settingsEdit.modelSetting
        model.maxTokens = newValue === 8192 ? 'inf' : newValue.toString()
        setSettingsEdit({ ...settingsEdit, modelSetting: model });
    };
    const handleMaxContextSliderChange = (event: Event, newValue: number | number[], activeThumb: number) => {
        let model = settingsEdit.modelSetting
        model.maxContextSize = newValue === 8192 ? 'inf' : newValue.toString()
        setSettingsEdit({ ...settingsEdit, modelSetting: model });
    };
    const handleTemperatureChange = (event: Event, newValue: number | number[], activeThumb: number) => {
        let model = settingsEdit.modelSetting
        model.temperature = typeof newValue === 'number' ? newValue : newValue[activeThumb]
        setSettingsEdit({ ...settingsEdit, modelSetting: model });
    };
    const handleRepliesTokensInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        if (value === 'inf') {
            let model = settingsEdit.modelSetting
            model.maxContextSize = 'inf'
            setSettingsEdit({ ...settingsEdit, modelSetting: model });
        } else {
            const numValue = Number(value);
            if (!isNaN(numValue) && numValue >= 0) {
                let model = settingsEdit.modelSetting
                model.maxContextSize = numValue > 8192 ? 'inf' : value
                setSettingsEdit({ ...settingsEdit, modelSetting: model });
            }
        }
    };
    const handleMaxContextInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        if (value === 'inf') {
            let model = settingsEdit.modelSetting
            model.maxContextSize = 'inf'
            setSettingsEdit({ ...settingsEdit, modelSetting: model });
        } else {
            const numValue = Number(value);
            if (!isNaN(numValue) && numValue >= 0) {
                let model = settingsEdit.modelSetting
                model.maxContextSize = numValue > 8192 ? 'inf' : value
                setSettingsEdit({ ...settingsEdit, modelSetting: model });
            }
        }
    };

    const [, { setMode }] = useThemeSwicher();
    useEffect(() => {
        setSettingsEdit(props.settings)
    }, [props.settings])

    const onCancel = () => {
        props.close()
        setSettingsEdit(props.settings)

        // need to restore the previous theme
        setMode(props.settings.theme ?? ThemeMode.System);
    }

    // preview theme
    const changeModeWithPreview = (newMode: ThemeMode) => {
        setSettingsEdit({ ...settingsEdit, theme: newMode });
        setMode(newMode);
    }

    // @ts-ignore
    // @ts-ignore
    return (
        <Dialog open={props.open} onClose={onCancel} fullWidth >
            <DialogTitle>{t('settings')}</DialogTitle>
            <DialogContent>
                <TextField
                    margin="dense"
                    label={t('system prompt')}
                    type="text"
                    fullWidth
                    variant="outlined"
                    multiline
                    value={settingsEdit.modelSetting.systemMessage}
                    onChange={(e) => {
                        let model = settingsEdit.modelSetting;
                        model.systemMessage = e.target.value.trim();
                        setSettingsEdit({ ...settingsEdit, modelSetting: model })
                    }}
                />

                <TextField
                    autoFocus
                    margin="dense"
                    label={t('openai api key')}
                    type="password"
                    fullWidth
                    variant="outlined"
                    value={settingsEdit.modelSetting.apiKey}
                    onChange={(e) => {
                        let model = settingsEdit.modelSetting;
                        model.apiKey = e.target.value.trim();
                        setSettingsEdit({ ...settingsEdit, modelSetting: model })
                    }}
                />
                <FormControl fullWidth variant="outlined" margin="dense">
                    <InputLabel htmlFor="language-select">{t('language')}</InputLabel>
                    <Select
                        label="language"
                        id="language-select"
                        value={settingsEdit.language}
                        onChange={(e) => {
                            setSettingsEdit({ ...settingsEdit, language: e.target.value });
                        }}>
                        {languages.map((language) => (
                            <MenuItem key={language} value={language}>
                                {languageMap[language]}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl sx={{ flexDirection: 'row', alignItems: 'center', paddingTop: 1, paddingBottom: 1 }}>
                    <span style={{ marginRight: 10 }}>{t('theme')}</span>
                    <ThemeChangeButton value={settingsEdit.theme} onChange={theme => changeModeWithPreview(theme)} />
                </FormControl>
                <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                    <InputLabel>Font Size</InputLabel>
                    <Select
                        labelId="select-font-size"
                        value={settingsEdit.fontSize}
                        label="FontSize"
                        onChange={(event) => {
                            setSettingsEdit({ ...settingsEdit, fontSize: event.target.value as number })
                        }}
                    >
                        {
                            [12, 13, 14, 15, 16, 17, 18].map((size) => (
                                <MenuItem key={size} value={size}>{size}px</MenuItem>
                            ))
                        }
                    </Select>
                </FormControl>

                <FormGroup>
                    <FormControlLabel control={<Switch />}
                        label={t('show word count')}
                        checked={settingsEdit.showWordCount}
                        onChange={(e, checked) => setSettingsEdit({ ...settingsEdit, showWordCount: checked })}
                    />
                </FormGroup>
                <FormGroup>
                    <FormControlLabel control={<Switch />}
                        label={t('show estimated token count')}
                        checked={settingsEdit.showTokenCount}
                        onChange={(e, checked) => setSettingsEdit({ ...settingsEdit, showTokenCount: checked })}
                    />
                </FormGroup>
                <Accordion>
                    <AccordionSummary aria-controls="panel1a-content">
                        <Typography>{t('proxy')}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <TextField
                            margin="dense"
                            label={t('api host')}
                            type="text"
                            fullWidth
                            variant="outlined"
                            value={settingsEdit.modelSetting.apiHost}
                            onChange={(e) => {
                                let model = settingsEdit.modelSetting
                                model.apiHost = e.target.value.trim()
                                setSettingsEdit({ ...settingsEdit, modelSetting: model })
                            }}
                        />

                        {
                            !settingsEdit.modelSetting.apiHost.match(/^(https?:\/\/)?api.openai.com(:\d+)?$/) && (
                                <Alert severity="warning">
                                    {t('proxy warning', { apiHost: settingsEdit.modelSetting.apiHost })}
                                    <Button onClick={() => {
                                        let model = settingsEdit.modelSetting
                                        model.apiHost = getDefaultSettings().modelSetting.apiHost
                                        setSettingsEdit({ ...settingsEdit, modelSetting: model })
                                    }}>{t('reset')}</Button>
                                </Alert>
                            )
                        }
                        {
                            settingsEdit.modelSetting.apiHost.startsWith('http://') && (
                                <Alert severity="warning">
                                    {<Trans
                                        i18nKey="protocol warning"
                                        components={{ bold: <strong /> }}
                                    />}
                                </Alert>
                            )
                        }
                        {
                            !settingsEdit.modelSetting.apiHost.startsWith('http') && (
                                <Alert severity="error">
                                    {<Trans
                                        i18nKey="protocol error"
                                        components={{ bold: <strong /> }}
                                    />}
                                </Alert>
                            )
                        }

                    </AccordionDetails>
                </Accordion>
                <Accordion>
                    <AccordionSummary
                        aria-controls="panel1a-content"
                    >
                        <Typography>{t('model')} & {t('token')} </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Alert severity="warning">
                            {t('settings modify warning')}
                            {t('please make sure you know what you are doing.')}
                            {t('click here to')}
                            <Button onClick={() => setSettingsEdit({
                                ...settingsEdit,
                                modelSetting: getDefaultSettings().modelSetting,
                                showModelName: getDefaultSettings().showModelName,
                            })}>{t('reset')}</Button>
                            {t('to default values.')}
                        </Alert>

                        <FormControl fullWidth variant="outlined" margin="dense">
                            <InputLabel htmlFor="model-select">{t('model')}</InputLabel>
                            <Select
                                label="Model"
                                id="model-select"
                                value={settingsEdit.modelSetting.name}
                                onChange={(e) => {
                                    let model = settingsEdit.modelSetting
                                    model.name = e.target.value
                                    setSettingsEdit({ ...settingsEdit, modelSetting: model })
                                }}>
                                {GPTModels.map((model) => (
                                    <MenuItem key={model} value={model}>
                                        {model}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Box sx={{ marginTop: 3, marginBottom: 1 }}>
                            <Typography id="discrete-slider" gutterBottom>
                                {t('temperature')}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                            <Box sx={{ width: '100%' }}>
                                <Slider
                                    value={settingsEdit.modelSetting.temperature}
                                    onChange={handleTemperatureChange}
                                    aria-labelledby="discrete-slider"
                                    valueLabelDisplay="auto"
                                    defaultValue={settingsEdit.modelSetting.temperature}
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
                                    value={settingsEdit.modelSetting.maxContextSize === 'inf' ? 8192 : Number(settingsEdit.modelSetting.maxContextSize)}
                                    onChange={handleMaxContextSliderChange}
                                    aria-labelledby="discrete-slider"
                                    valueLabelDisplay="auto"
                                    defaultValue={settingsEdit.modelSetting.maxContextSize === 'inf' ? 8192 : Number(settingsEdit.modelSetting.maxContextSize)}
                                    step={64}
                                    min={64}
                                    max={8192}
                                />
                            </Box>
                            <TextField
                                sx={{ marginLeft: 2 }}
                                value={settingsEdit.modelSetting.maxContextSize}
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
                                    value={settingsEdit.modelSetting.maxTokens === 'inf' ? 8192 : Number(settingsEdit.modelSetting.maxTokens)}
                                    defaultValue={settingsEdit.modelSetting.maxTokens === 'inf' ? 8192 : Number(settingsEdit.modelSetting.maxTokens)}
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
                                value={settingsEdit.modelSetting.maxTokens}
                                onChange={handleRepliesTokensInputChange}
                                type="text"
                                size="small"
                                variant="outlined"
                            />
                        </Box>

                        <FormGroup>
                            <FormControlLabel control={<Switch />}
                                label={t('show model name')}
                                checked={settingsEdit.showModelName}
                                onChange={(e, checked) => setSettingsEdit({ ...settingsEdit, showModelName: checked })}
                            />
                        </FormGroup>

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
