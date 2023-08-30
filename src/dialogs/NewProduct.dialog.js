import {Button} from "primereact/button";
import React, {useContext, useEffect, useRef, useState} from "react";
import {Dialog} from "primereact/dialog";
import {InputText} from "primereact/inputtext";
import {UserContext} from "../contexts/user.context";
import {Toast} from "primereact/toast";
import {classNames} from "primereact/utils";
import {Calendar} from "primereact/calendar";

export function DataForm(){
    let emptyProduct = {
        experiment_name: '',
        experiment_dt: null,
        experiment_location: '',
        polymer_name: '',
        polymer_mw: '',
        polymer_rr: '',
        polymer_batch: '',
        polymer_company: '',
        solvent: '',
        dopant_name: '',
        dopant_batch: '',
        dopant_company: '',
        loading_polymer: '',
        loading_dopant: '',
        loading_solvent: '',
        temperature: '',
        print_speed: '',
        print_voltage: '',
        print_head_diameter: '',
        substrate_name: '',
        substrate_company: '',
        annealing_temperature: '',
        annealing_duration: '',
        fab_box: '',
        fab_humidity: '',
        other: '',
        uv_vis_nil_files : [],
        jv_files : [],
        profilometry_files : [],
        giwaxs_files : [],
        skpm_files : []
    };

    const {user} = useContext(UserContext);
    const [submitted, setSubmitted] = useState(false);
    const [productDialog, setProductDialog] = useState(false);
    const toast = useRef(null);
    const [product, setProduct] = useState(emptyProduct);



    const openNew = () => {
        setProduct(emptyProduct);
        setSubmitted(false);
        setProductDialog(true);
    };



    const saveProduct = async () => {
        setSubmitted(true);
        if (product.polymer_name.trim()) {
            let _product = {...product};
            const functionName = "putProductInfo";
            const args = [_product];
            let result = await user.callFunction(functionName, ...args);
            result = JSON.parse(JSON.stringify(result));
            _product.id = result['insertedId'];
            toast.current.show({severity: 'success', summary: 'Successful', detail: 'Product Created', life: 3000});
            setProductDialog(false);
            setProduct(emptyProduct);
        }
    };

    const productDialogFooter = (
        <React.Fragment>
            <Button label="Cancel" icon="pi pi-times" outlined onClick={hideProductDialog} />
            <Button label="Save" icon="pi pi-check" onClick={saveProduct} />
        </React.Fragment>
    );

    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _product = { ...product };

        _product[`${name}`] = val;

        setProduct(_product);
    };

    function hideProductDialog() {
        setSubmitted(false);
        setProductDialog(false);
    }



    return(

        <div>
            <Toast ref={toast} />
            <Button label="New" icon="pi pi-plus" severity="success" onClick={openNew} />
            <Dialog visible={productDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Product Details" modal className="p-fluid" footer={productDialogFooter} onHide={hideProductDialog}>
                <div className="font-bold underline h-2rem">
                    TYPE A
                </div>
                <div className="font-bold underline">
                    Experiment Info:
                </div>
                <div className="field">
                    <label htmlFor="experiment_name" className="font-bold">
                        Experiment Name
                    </label>
                    <InputText id="experiment_name" value={product.experiment_name} onChange={(e) => onInputChange(e, 'experiment_name')}  />
                </div>
                <div className="field">
                    <label htmlFor="experiment_dt" className="font-bold ">
                        Date and time of experiment<font color="red">*</font>
                    </label>
                    <Calendar value={product.experiment_dt} onChange={(e) => onInputChange(e, 'experiment_dt')} showTime hourFormat="24" />
                    {submitted && !product.experiment_dt && <small className="p-error">Date and time are required.</small>}
                </div>
                <div className="field">
                    <label htmlFor="experiment_location" className="font-bold">
                        Location
                    </label>
                    <InputText id="experiment_location" value={product.experiment_location} onChange={(e) => onInputChange(e, 'experiment_location')}  />
                </div>
                <div className="font-bold underline">
                    Polymer Info:
                </div>
                <div className="field">
                    <label htmlFor="polymer_name" className="font-bold ">
                        Name<font color="red">*</font>
                    </label>
                    <InputText id="polymer_name" value={product.polymer_name} onChange={(e) => onInputChange(e, 'polymer_name')}    />
                    {submitted && !product.polymer_name && <small className="p-error">Polymer name is required.</small>}
                </div>
                <div className="field">
                    <label htmlFor="polymer_mw" className="font-bold">
                        MW
                    </label>
                    <InputText id="polymer_mw" value={product.polymer_mw} onChange={(e) => onInputChange(e, 'polymer_mw')}   />
                </div>
                <div className="field">
                    <label htmlFor="polymer_rr" className="font-bold">
                        RR
                    </label>
                    <InputText id="polymer_rr" value={product.polymer_rr} onChange={(e) => onInputChange(e, 'polymer_rr')}   />
                </div>
                <div className="field">
                    <label htmlFor="polymer_batch" className="font-bold">
                        Batch
                    </label>
                    <InputText id="polymer_batch" value={product.polymer_batch} onChange={(e) => onInputChange(e, 'polymer_batch')}  />
                </div>
                <div className="field">
                    <label htmlFor="polymer_company" className="font-bold">
                        Company
                    </label>
                    <InputText id="polymer_company" value={product.polymer_company} onChange={(e) => onInputChange(e, 'polymer_company')}  />
                </div>
                <div className="field">
                    <label htmlFor="solvent" className="font-bold underline">
                        Solvent/co-solvent info :
                    </label>
                    <InputText id="solvent" value={product.solvent} onChange={(e) => onInputChange(e, 'solvent')}  />
                </div>
                <div className="font-bold underline">
                    Dopant Info:
                </div>
                <div className="field">
                    <label htmlFor="dopant_name" className="font-bold">
                        Name
                    </label>
                    <InputText id="dopant_name" value={product.dopant_name} onChange={(e) => onInputChange(e, 'dopant_name')}  />
                </div>
                <div className="field">
                    <label htmlFor="dopant_batch" className="font-bold">
                        Batch
                    </label>
                    <InputText id="dopant_batch" value={product.dopant_batch} onChange={(e) => onInputChange(e, 'dopant_batch')}  />
                </div>
                <div className="field">
                    <label htmlFor="dopant_company" className="font-bold">
                        Company
                    </label>
                    <InputText id="dopant_company" value={product.dopant_company} onChange={(e) => onInputChange(e, 'dopant_company')}  />
                </div>
                <div className="font-bold underline">
                    Loading Info:
                </div>
                <div className="field">
                    <label htmlFor="loading_polymer" className="font-bold">
                        Polymer amount
                    </label>
                    <InputText id="loading_polymer" value={product.loading_polymer} onChange={(e) => onInputChange(e, 'loading_polymer')}  />
                </div>
                <div className="field">
                    <label htmlFor="loading_dopant" className="font-bold">
                        Dopant amount
                    </label>
                    <InputText id="loading_dopant" value={product.loading_dopant} onChange={(e) => onInputChange(e, 'loading_dopant')}  />
                </div>
                <div className="field">
                    <label htmlFor="loading_solvent" className="font-bold">
                        Solvent / Co-solvent mic ect
                    </label>
                    <InputText id="loading_solvent" value={product.loading_solvent} onChange={(e) => onInputChange(e, 'loading_solvent')}  />
                </div>
                <div className="field">
                    <label htmlFor="temperature" className="font-bold underline">
                        Temperature :
                    </label>
                    <InputText id="temperature" value={product.temperature} onChange={(e) => onInputChange(e, 'temperature')}  />
                </div>
                <div className="font-bold underline">
                    Print Info:
                </div>
                <div className="field">
                    <label htmlFor="print_speed" className="font-bold">
                        Print Speed
                    </label>
                    <InputText id="print_speed" value={product.print_speed} onChange={(e) => onInputChange(e, 'print_speed')}  />
                </div>
                <div className="field">
                    <label htmlFor="print_voltage" className="font-bold">
                        Print Voltage
                    </label>
                    <InputText id="print_voltage" value={product.print_voltage} onChange={(e) => onInputChange(e, 'print_voltage')}  />
                </div>
                <div className="field">
                    <label htmlFor="print_head_diameter" className="font-bold">
                        Print Head diameter
                    </label>
                    <InputText id="print_head_diameter" value={product.print_head_diameter} onChange={(e) => onInputChange(e, 'print_head_diameter')}  />
                </div>
                <div className="font-bold underline">
                    Substrate Info:
                </div>
                <div className="field">
                    <label htmlFor="substrate_name" className="font-bold">
                        Name
                    </label>
                    <InputText id="substrate_name" value={product.substrate_name} onChange={(e) => onInputChange(e, 'substrate_name')}  />
                </div>
                <div className="field">
                    <label htmlFor="substrate_company" className="font-bold">
                        Company
                    </label>
                    <InputText id="substrate_company" value={product.substrate_company} onChange={(e) => onInputChange(e, 'substrate_company')}  />
                </div>
                <div className="font-bold underline">
                    Annealing Info:
                </div>
                <div className="field">
                    <label htmlFor="annealing_temperature" className="font-bold">
                        Temperature
                    </label>
                    <InputText id="annealing_temperature" value={product.annealing_temperature} onChange={(e) => onInputChange(e, 'annealing_temperature')}  />
                </div>
                <div className="field">
                    <label htmlFor="annealing_duration" className="font-bold">
                        Duration
                    </label>
                    <InputText id="annealing_duration" value={product.annealing_duration} onChange={(e) => onInputChange(e, 'annealing_duration')}  />
                </div>
                <div className="font-bold underline">
                    Fab environment :
                </div>
                <div className="field">
                    <label htmlFor="fab_box" className="font-bold">
                        Air/ glove box
                    </label>
                    <InputText id="fab_box" value={product.fab_box} onChange={(e) => onInputChange(e, 'fab_box')}  />
                </div>
                <div className="field">
                    <label htmlFor="fab_humidity" className="font-bold">
                        Humidity
                    </label>
                    <InputText id="fab_humidity" value={product.fab_humidity} onChange={(e) => onInputChange(e, 'fab_humidity')}  />
                </div>
                <div className="field">
                    <label htmlFor="other" className="font-bold underline">
                        Other info :
                    </label>
                    <InputText id="other" value={product.other} onChange={(e) => onInputChange(e, 'other')}  />
                </div>
            </Dialog>
        </div>
    );
}