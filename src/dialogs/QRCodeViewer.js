import React, {useState} from "react";
import QRCode from "qrcode.react";
import {Dialog} from "primereact/dialog";
import {Button} from "primereact/button";

export function QRCodeViewer(rowData){
    const [showQRDialog, setShowQRDialog] = useState(false);

    const showQRCode = (data) => {

        setShowQRDialog(true);
    };
    const hideQRCode = () => {
        setShowQRDialog(false);
    };

    return(
        <div>

            <Button icon="pi pi-qrcode" rounded outlined className="ml-2" onClick={()=> showQRCode(rowData)} />
            <Dialog
                visible={showQRDialog}
                onHide={hideQRCode}
                header="QR Code"
                className="qr-code-modal"
            >
                {rowData && (
                    <div className="qr-code-container">
                        <QRCode value={JSON.stringify({"_id": rowData.rowData._id})} size={256} />
                        <div style={{ height : '10px', color : 'black' }}>{rowData?._id?.toHexString()}</div>
                    </div>
                )}
            </Dialog>
        </div>
    );

}