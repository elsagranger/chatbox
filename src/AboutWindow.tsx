import React, { useEffect, useState } from 'react';
import {
    Button, Paper, Badge, Box, Divider,
    Dialog, DialogContent, DialogActions, DialogTitle, Stack,
} from '@mui/material';
import iconPNG from './icon.png'
import { Trans, useTranslation } from 'react-i18next'
import * as api from './api'
import { SponsorAboutBanner } from './types';

interface Props {
    open: boolean
    version: string
    lang: string
    close(): void
}

export default function AboutWindow(props: Props) {
    const { t } = useTranslation()
    return (
        <Dialog open={props.open} onClose={props.close} fullWidth>
            <DialogTitle>{t('About Chatbox')}</DialogTitle>
            <DialogContent>
                <Box sx={{ textAlign: 'center', padding: '0 20px' }}>
                    <img src={iconPNG} style={{ width: '100px', margin: 0 }} />
                    <h3 style={{ margin: '4px 0 5px 0' }}>Chatbox(v{props.version})</h3>
                    <span>
                        <Trans 
                            i18nKey="About Message"
                            values={{ Author: "Benn Huang" }}
                            components={[<a href={`https://chatboxai.app/redirect_app/author/${props.lang}`} target='_blank'></a>]}
                        />
                    </span>
                </Box>
                <Paper elevation={3} sx={{ padding: '10px 10px 5px 10px', backgroundColor: 'paper', marginTop: '30px' }}>
                    <span>{t("Auther Message")}</span>
                    <Stack spacing={2} direction="row" >
                        <Button variant="text" onClick={() => api.openLink(`https://chatboxai.app/redirect_app/donate/${props.lang}`)} >
                            {t('Donate')}
                        </Button>
                        <Button variant="text" onClick={() => api.openLink(`https://chatboxai.app/redirect_app/become_sponsor/${props.lang}`)} >
                            {t('Or become a sponsor')}
                        </Button>
                    </Stack>
                </Paper>
            </DialogContent>
            <DialogActions>
                <Button onClick={props.close}>{t('close')}</Button>
            </DialogActions>
        </Dialog>
    );
}
