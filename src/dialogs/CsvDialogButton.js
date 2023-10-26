import React, { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import Plot from 'react-plotly.js';
import axios from 'axios';
import Papa from 'papaparse';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

export function CsvDialogButton({ url, experiment_name, experiment_type }) {
    const [visible, setVisible] = useState(false);
    const [data, setData] = useState(null);
    const loadCsvData = async () => {
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: url,  // using url prop here
            headers: {},
        };
        try {
            const response = await axios.request(config);
            const csvData = response.data;
            // setData(csvData.data)
            Papa.parse(csvData, {
                header: false,
                dynamicTyping: true,
                complete: (result) => {
                    setData(result.data);
                },
            });

        } catch (error) {
            console.error('Error fetching CSV data:', error);
        }
    };

    const onHide = () => setVisible(false);

    const dialogFooter = (
        <button onClick={onHide}>Close</button>
    );

    const plotData = [
        {
            type: 'scatter',  // Assuming scatter plot, adjust accordingly
            x: data ? data.map(row => row[0]) : [],
            y: data ? data.map(row => row[1]) : [],
            mode: 'markers',
        },
    ];

    return (
        <div>
            <button onClick={() => { setVisible(true); loadCsvData(); }}>Load and Plot CSV</button>
            <Dialog
                header= {"Experiment type : " + experiment_type}
                visible={visible}
                onHide={onHide}
                footer={dialogFooter}>
                <Plot data={plotData} layout={{title: experiment_name}}/>
            </Dialog>
        </div>
    );
}
