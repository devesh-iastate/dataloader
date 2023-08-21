import QrScanner from 'react-qr-scanner'
import {Dialog} from "primereact/dialog";
import React, {useState} from "react";
import {Button} from "primereact/button";

export function QRScanner({setGlobalFilter}){
    const [showQRScanDialog, setShowQRScanDialog] = useState(false);
    const [scanResult, setScanResult] = useState('');

    const showScanWindow = () => {
        setShowQRScanDialog(true);
    }

    const hideScanWindow = () => {
        setShowQRScanDialog(false);
    }

    const handleError = (error) => {
        console.log(error);
    }

    const handleScan = data => {
        if (data) {
            const jsonObject = JSON.parse(data.text);
            // setScanResult(jsonObject.rowData._id);
            setShowQRScanDialog(false);
            setGlobalFilter(jsonObject._id);
        }
    }

    return(
        <div>
            <Button label="Scan" icon="pi pi-qrcode" className="p-button-help" onClick={showScanWindow} />
            <Dialog visible={showQRScanDialog} onHide={hideScanWindow}  header="Scan QR Code" className="qr-code-modal">
                <div>
                    <QrScanner delay={300} onError={handleError} onScan={handleScan} style={{ width: '100%' }} constraints={{audio: false, video: {facingMode: "environment"}}}/>
                    <p>{scanResult}</p>
                </div>
            </Dialog>
        </div>
    );
}