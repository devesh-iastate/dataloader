import {Button} from "primereact/button";
import React, {useContext, useEffect, useRef, useState} from "react";
import {Dialog} from "primereact/dialog";
import {InputTextarea} from "primereact/inputtextarea";
import {TabPanel, TabView} from "primereact/tabview";
import {UserContext} from "../contexts/user.context";
import {Toast} from "primereact/toast";
import {Calendar} from "primereact/calendar";
import {InputText} from "primereact/inputtext";
import UploadComponent from "./FIleUpload/UploadComponent";
import {v4} from "uuid";
import axios from 'axios';
import {CsvDialogButton} from "./CsvDialogButton";

const allTypes = [   "uv_vis_nir_files" ,
    "iv_files" ,
    "profilometry_files" ,
    "giwaxs_files" ,
    "skpm_files" ]

export function UpdateProductInfo({rowData}) {

    console.log(rowData)

    let emptyProduct = {
        polymerInfo: ''
    }

    const [showProductInfo, setShowProductInfo] = useState(false);
    const [formData, setFormData] = useState( null);
    const [fileNames, setFileNames] = useState({});//[...rowData?.uv_vis_nir_files, ...rowData?.iv_files, ...rowData?.profilometry_files, ...rowData?.giwaxs_files, ...rowData?.skpm_files] || [
    const [imageNames, setImageNames] = useState([])  ;
    const [submitted, setSubmitted] = useState(false);
    const toast = useRef(null);
    const { user} = useContext(UserContext);
    const [file, setFile] = useState(null);

    const functionToSetFiles = ( acceptedFiles, type) => {

        // const typeValues = file?.[type] || [];
        // typeValues.push(...acceptedFiles);
        setFile(prev => (
            { ...prev, [type] : [ ...acceptedFiles ] }
        ))
    }

    const uploadFile = async (fileTypeVal) => {
        try {
            // for ( let j=0; j<allTypes.length; j++) {
            //     let typeVal = allTypes[j];
            // // }
            let newImageNames = {}
                const typeVal = fileTypeVal
                if (file?.[typeVal]?.length === 0 || !file?.[typeVal]) return [];
                let promiseArr = [];
                const newFileAddedTypeWise = []
                for (let i = 0; i < file?.[typeVal]?.length || 0; i++) {
                    const fileVal = file?.[typeVal]?.[i]
                    const uuidVal = v4() + '_' + file?.[typeVal]?.[i].name
                    // const imageRef = ref(storage, `images/${uuidVal}`);
                    // let uploadPromise = await uploadBytes(imageRef, fileVal)
                    const form = new FormData();
                    const url = process.env.REACT_APP_DIGITAL_OCEAN_URL;
                    // const url = "http://127.0.0.1:8000/upload_file"
                    await user.refreshAccessToken();
                    const userToken = await user.accessToken;
                    form.append('file', fileVal, uuidVal);
                    form.append('token', userToken);
                    form.append('folder', formData?._id.toHexString());
                    //newFileAddedTypeWise.push(uuidVal);
                    try{
                        const response = await axios.post(url, form, {
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'multipart/form-data',
                            },
                        });
                        debugger
                        newFileAddedTypeWise.push({url : response?.data?.url, name : uuidVal});

                    } catch (error) {
                        console.error('Error during file upload: ', error);
                        return false;
                    }
                    // promiseArr.push(uploadPromise);
                }
                const prevTypeWise = imageNames[typeVal] || [];
                newImageNames = {...imageNames, [typeVal]: [...prevTypeWise, ...newFileAddedTypeWise]}
                setImageNames(prev => ({...prev, [typeVal]: [...prevTypeWise, ...newFileAddedTypeWise]}))
                // await Promise.all(promiseArr)


            return newImageNames;

        }
        catch (err){
            return false;
        }
    };


    useEffect( ()=>{
        setFormData({
            ...rowData
        })
    },[])


    function hideProductInfo() {
        setFormData({})
        setShowProductInfo(false);
    }
    const openNew = () => {
           // setProduct(emptyProduct);
            // setSubmitted(false);
        setFormData({...rowData})
            setShowProductInfo(true);

        };

    const saveProduct = async (fileTypeVal) => {

        try{
            let uploadValues = await uploadFile(fileTypeVal);
            // debugger
            if(!uploadValues){
                toast.current.show({severity: 'error', summary: 'Error', detail: 'Error in uploading files', life: 3000});
                return;
            }
            const functionName = "updateProductInfo";
            let args = { ...formData }
            let typeValueObject = {}
            for( const typeVal of allTypes){
                const formTypeWise = formData?.[typeVal] || [];
                if( uploadValues?.[typeVal] === undefined || uploadValues?.[typeVal]?.url?.length === 0) continue;
                formTypeWise.push(...uploadValues?.[typeVal])
                typeValueObject = { ...typeValueObject, [typeVal] : formTypeWise}
            }
            args = { ...args, ...typeValueObject }
            //const args = {...formData,  ...uploadValues  };
            await user.callFunction(functionName, args);
            toast.current.show({severity: 'success', summary: 'Successful', detail: 'Product Info Updated', life: 3000});
            setShowProductInfo(false);
            window.location.reload(true);
        }catch (e) {
            toast.current.show({severity: 'error', summary: 'Error', detail: 'Error in updating product info', life: 3000});
        }

    }

    const setFormDataValue = (key, value) => {
        setFormData(prev => ({...prev, [key]: value}));
    }
    return(
        <div>
            <Toast ref={toast} />
            <Button icon="pi pi-plus" rounded outlined className="mr-2" onClick={openNew} />
            <Dialog visible={showProductInfo} style={{ width: '100vw' }} onHide={hideProductInfo} header="Product Info">
                <TabView scrollable>
                    <TabPanel header="Type A">
                        <div>
                            <font color="red">Type A changes will not be saved!</font>
                            <div className="font-bold underline">
                                Experiment Info:
                            </div>
                            <div className="field">
                                <label htmlFor="experiment_name" className="font-bold">
                                    Experiment Name
                                </label><br />
                                <InputText id="experiment_name" value={formData?.experiment_name}  />
                            </div>
                                <div className="field">
                                <label htmlFor="experiment_dt" className="font-bold">
                                Date and time of experiment
                                </label><br />
                                <Calendar value={formData?.experiment_dt}  showTime hourFormat="24" />
                                </div>
                            <div className="field">
                                <label htmlFor="experiment_location" className="font-bold">
                                    Location
                                </label><br />
                                <InputText id="experiment_location" value={formData?.experiment_location}  />
                            </div>
                            <div className="font-bold underline">
                                Polymer Info:
                            </div>
                            <div className="field">
                                <label htmlFor="polymer_name" className="font-bold">
                                    Name
                                </label><br />
                                <InputText id="polymer_name" value={formData?.polymer_name}    />
                            </div>
                            <div className="field">
                                <label htmlFor="polymer_mw" className="font-bold">
                                    MW
                                </label><br />
                                <InputText id="polymer_mw" value={formData?.polymer_mw}   />
                            </div>
                            <div className="field">
                                <label htmlFor="polymer_rr" className="font-bold">
                                    RR
                                </label><br />
                                <InputText id="polymer_rr" value={formData?.polymer_rr}   />
                            </div>
                            <div className="field">
                                <label htmlFor="polymer_batch" className="font-bold">
                                    Batch
                                </label><br />
                                <InputText id="polymer_batch" value={formData?.polymer_batch}   />
                            </div>
                            <div className="field">
                                <label htmlFor="polymer_company" className="font-bold">
                                    Company
                                </label><br />
                                <InputText id="polymer_company" value={formData?.polymer_company}  />
                            </div>
                            <div className="field">
                                <label htmlFor="solvent" className="font-bold underline">
                                    Solvent/co-solvent info :
                                </label><br />
                                <InputText id="solvent" value={formData?.solvent}  />
                            </div>
                            <div className="font-bold underline">
                                Dopant Info:
                            </div>
                            <div className="field">
                                <label htmlFor="dopant_name" className="font-bold">
                                    Name
                                </label><br />
                                <InputText id="dopant_name" value={formData?.dopant_name}   />
                            </div>
                            <div className="field">
                                <label htmlFor="dopant_batch" className="font-bold">
                                    Batch
                                </label><br />
                                <InputText id="dopant_batch" value={formData?.dopant_batch}  />
                            </div>
                            <div className="field">
                                <label htmlFor="dopant_company" className="font-bold">
                                    Company
                                </label><br />
                                <InputText id="dopant_company" value={formData?.dopant_company} />
                            </div>
                            <div className="font-bold underline">
                                Loading Info:
                            </div>
                            <div className="field">
                                <label htmlFor="loading_polymer" className="font-bold">
                                    Polymer amount
                                </label><br />
                                <InputText id="loading_polymer" value={formData?.loading_polymer} />
                            </div>
                            <div className="field">
                                <label htmlFor="loading_dopant" className="font-bold">
                                    Dopant amount
                                </label><br />
                                <InputText id="loading_dopant" value={formData?.loading_dopant}  />
                            </div>
                            <div className="field">
                                <label htmlFor="loading_solvent" className="font-bold">
                                    Solvent / Co-solvent mic ect
                                </label><br />
                                <InputText id="loading_solvent" value={formData?.loading_solvent}  />
                            </div>
                            <div className="field">
                                <label htmlFor="temperature" className="font-bold underline">
                                    Temperature :
                                </label><br />
                                <InputText id="temperature" value={formData?.temperature} />
                            </div>
                            <div className="font-bold underline">
                                Print Info:
                            </div>
                            <div className="field">
                                <label htmlFor="print_speed" className="font-bold">
                                    Print Speed
                                </label><br />
                                <InputText id="print_speed" value={formData?.print_speed}  />
                            </div>
                            <div className="field">
                                <label htmlFor="print_voltage" className="font-bold">
                                    Print Voltage
                                </label><br />
                                <InputText id="print_voltage" value={formData?.print_voltage}   />
                            </div>
                            <div className="field">
                                <label htmlFor="print_head_diameter" className="font-bold">
                                    Print Head diameter
                                </label><br />
                                <InputText id="print_head_diameter" value={formData?.print_head_diameter}  />
                            </div>
                            <div className="font-bold underline">
                                Substrate Info:
                            </div>
                            <div className="field">
                                <label htmlFor="substrate_name" className="font-bold">
                                    Name
                                </label><br />
                                <InputText id="substrate_name" value={formData?.substrate_name}  />
                            </div>
                            <div className="field">
                                <label htmlFor="substrate_company" className="font-bold">
                                    Company
                                </label><br />
                                <InputText id="substrate_company" value={formData?.substrate_company}  />
                            </div>
                            <div className="font-bold underline">
                                Annealing Info:
                            </div>
                            <div className="field">
                                <label htmlFor="annealing_temperature" className="font-bold">
                                    Temperature
                                </label><br />
                                <InputText id="annealing_temperature" value={formData?.annealing_temperature}  />
                            </div>
                            <div className="field">
                                <label htmlFor="annealing_duration" className="font-bold">
                                    Duration
                                </label><br />
                                <InputText id="annealing_duration" value={formData?.annealing_duration}  />
                            </div>
                            <div className="font-bold underline">
                                Fab environment :
                            </div>
                            <div className="field">
                                <label htmlFor="fab_box" className="font-bold">
                                    Air / Glove box
                                </label><br />
                                <InputText id="fab_box" value={formData?.fab_box}   />
                            </div>
                            <div className="field">
                                <label htmlFor="fab_humidity" className="font-bold">
                                    Humidity
                                </label><br />
                                <InputText id="fab_humidity" value={formData?.fab_humidity}   />
                            </div>
                            <div className="field">
                                <label htmlFor="other" className="font-bold underline">
                                    Other info :
                                </label><br />
                                <InputText id="other" value={formData?.other}  />
                            </div>
                        </div>
                    </TabPanel>
                    <TabPanel header="Film thickness">
                        <div>
                            <div className="field">
                                <label className="font-bold">
                                    Instrument Info
                                </label><br/>
                                <InputTextarea name='film_thickness_instrument' autoResize value={formData?.film_thickness_instrument} onChange={e=> setFormDataValue(e.target.name, e.target.value)} required rows={3} cols={20} />
                            </div>
                            <div className="field">
                                <label className="font-bold">
                                    Output Format
                                </label><br/>
                                <InputTextarea name='film_thickness_format' autoResize value={formData?.film_thickness_format} onChange={e=> setFormDataValue(e.target.name, e.target.value)} required rows={3} cols={20} />
                            </div>
                            <div className="field">
                                <label className="font-bold">
                                    Features to be extracted
                                </label><br/>
                                <InputTextarea name='film_thickness_features' autoResize value={formData?.film_thickness_features} onChange={e=> setFormDataValue(e.target.name, e.target.value)} required rows={3} cols={20} />
                            </div>
                            <Button label="Submit" onClick={()=>saveProduct(allTypes[0])}/>
                        </div>
                    </TabPanel>
                    <TabPanel header="UV-Vis-NIR">
                        <div>
                            <div className="field">
                                <label className="font-bold">
                                    Instrument Info
                                </label><br/>
                                <InputTextarea name='uv_vis_nir_instrument' autoResize value={formData?.uv_vis_nir_instrument} onChange={e=> setFormDataValue(e.target.name, e.target.value)} required rows={3} cols={20} />
                            </div>
                            <div className="field">
                                <label className="font-bold">
                                    Output Format
                                </label><br/>
                                <InputTextarea name='uv_vis_nir_format' autoResize value={formData?.uv_vis_nir_format} onChange={e=> setFormDataValue(e.target.name, e.target.value)} required rows={3} cols={20} />
                            </div>
                            <div className="field">
                                <label className="font-bold">
                                    Features to be extracted
                                </label><br/>
                                <InputTextarea name='uv_vis_nir_features' autoResize value={formData?.uv_vis_nir_features} onChange={e=> setFormDataValue(e.target.name, e.target.value)} required rows={3} cols={20} />
                            </div>
                            <div className="field">
                                <label className="font-bold">
                                    Upload
                                </label><br/>
                                <UploadComponent setFile={functionToSetFiles} type={"uv_vis_nir_files"} />
                            </div>
                            <div>
                                <label className="font-bold">
                                    Uploaded Files
                                </label><br/>
                                <div>
                                    { formData?.["uv_vis_nir_files"]?.map(val => <div>
                                        {/*{JSON.stringify(val)}*/}
                                        <li><a href={val?.url}>{val?.name}</a> {val?.name.endsWith('.csv') && (
                                            <CsvDialogButton url={val?.url}  experiment_name={formData?.experiment_name} experiment_type="UV-Vis-NIR"/>

                                        )}</li>
                                    </div>) }
                                </div>
                            </div>
                            <Button label="Submit" onClick={()=>saveProduct(allTypes[0])}/>
                        </div>
                    </TabPanel>
                    <TabPanel header="I-V">
                        <div>
                            <div className="field">
                                <label className="font-bold">
                                    Instrument Info
                                </label><br/>
                                <InputTextarea name='iv_instrument' autoResize value={formData?.iv_instrument} onChange={e=> setFormDataValue(e.target.name, e.target.value)} required rows={3} cols={20} />
                            </div>
                            <div className="field">
                                <label className="font-bold">
                                    Output Format
                                </label><br/>
                                <InputTextarea name='iv_format' autoResize value={formData?.iv_format} onChange={e=> setFormDataValue(e.target.name, e.target.value)} required rows={3} cols={20} />
                            </div>
                            <div className="field">
                                <label className="font-bold">
                                    Features to be extracted
                                </label><br/>
                                <InputTextarea name='iv_features' autoResize value={formData?.iv_features} onChange={e=> setFormDataValue(e.target.name, e.target.value)} required rows={3} cols={20} />
                            </div>
                            <div className="field">
                                <label className="font-bold">
                                    Upload
                                </label><br/>
                                <UploadComponent setFile={functionToSetFiles} type={"iv_files"} />
                            </div>

                            <div>
                                <label className="font-bold">
                                    Uploaded Files
                                </label><br/>
                                <div>
                                    { formData?.["iv_files"]?.map(val => <div>
                                        <li><a href={val?.url}>{val?.name}</a> {val?.name.endsWith('.csv') && (
                                            <CsvDialogButton url={val?.url} experiment_name={val?.experiment_name} experiment_type="I-V"/>
                                        )}
                                        </li>
                                    </div>) }
                                </div>
                            </div>
                            {/*<Button label="Submit" onClick={saveProduct}/>*/}
                            <Button label="Submit" onClick={()=>saveProduct(allTypes[1])}/>
                        </div>
                    </TabPanel>
                    <TabPanel header="Profilometry">
                        <div>
                            <div className="field">
                                <label className="font-bold">
                                    Instrument Info
                                </label><br/>
                                <InputTextarea name='profilometry_instrument' autoResize value={formData?.profilometry_instrument} onChange={e=> setFormDataValue(e.target.name, e.target.value)} required rows={3} cols={20} />
                            </div>
                            <div className="field">
                                <label className="font-bold">
                                    Output Format
                                </label><br/>
                                <InputTextarea name='profilometry_format' autoResize value={formData?.profilometry_format} onChange={e=> setFormDataValue(e.target.name, e.target.value)} required rows={3} cols={20} />
                            </div>
                            <div className="field">
                                <label className="font-bold">
                                    Features to be extracted
                                </label><br/>
                                <InputTextarea name='profilometry_features' autoResize value={formData?.profilometry_features} onChange={e=> setFormDataValue(e.target.name, e.target.value)} required rows={3} cols={20} />
                            </div>
                            <div className="field">
                                <label className="font-bold">
                                    Upload
                                </label><br/>
                                <UploadComponent setFile={functionToSetFiles} type={"profilometry_files"} />
                            </div>
                            <div>
                                <label className="font-bold">
                                    Uploaded Files
                                </label><br/>
                                <div>
                                    { formData?.["profilometry_files"]?.map(  val => <div>
                                        <li>
                                            <a href={val?.url}>{val?.name}</a>{val?.name.endsWith('.csv') && (
                                            <CsvDialogButton url={val?.url}  experiment_name={val?.experiment_name} experiment_type="Profilometry"/>
                                        )}
                                        </li>
                                    </div>) }
                                </div>
                            </div>
                            {/*<Button label="Submit" onClick={saveProduct}/>*/}
                            <Button label="Submit" onClick={()=>saveProduct(allTypes[2])}/>
                        </div>
                    </TabPanel>
                    <TabPanel header="Conductivity (from I-V & profilometry)">
                        <div>
                            <div className="field">
                                <label className="font-bold">
                                    Instrument Info
                                </label><br/>
                                <InputTextarea name='conductivity_instrument' autoResize value={formData?.conductivity_instrument} onChange={e=> setFormDataValue(e.target.name, e.target.value)} required rows={3} cols={20} />
                            </div>
                            <div className="field">
                                <label className="font-bold">
                                    Output Format
                                </label><br/>
                                <InputTextarea name='conductivity_format' autoResize value={formData?.conductivity_format} onChange={e=> setFormDataValue(e.target.name, e.target.value)} required rows={3} cols={20} />
                            </div>
                            <div className="field">
                                <label className="font-bold">
                                    Features to be extracted
                                </label><br/>
                                <InputTextarea name='conductivity_features' autoResize value={formData?.conductivity_features} onChange={e=> setFormDataValue(e.target.name, e.target.value)} required rows={3} cols={20} />
                            </div>
                            <Button label="Submit" onClick={saveProduct}/>
                        </div>
                    </TabPanel>
                    <TabPanel header="GIWAXS (NSLS II)
">
                        <div>
                            <div className="field">
                                <label className="font-bold">
                                    Instrument Info
                                </label><br/>
                                <InputTextarea name='giwaxs_instrument' autoResize value={formData?.giwaxs_instrument} onChange={e=> setFormDataValue(e.target.name, e.target.value)} required rows={3} cols={20} />
                            </div>
                            <div className="field">
                                <label className="font-bold">
                                    Output Format
                                </label><br/>
                                <InputTextarea name='giwaxs_format' autoResize value={formData?.giwaxs_format} onChange={e=> setFormDataValue(e.target.name, e.target.value)} required rows={3} cols={20} />
                            </div>
                            <div className="field">
                                <label className="font-bold">
                                    Features to be extracted
                                </label><br/>
                                <InputTextarea name='giwaxs_features' autoResize value={formData?.giwaxs_features} onChange={e=> setFormDataValue(e.target.name, e.target.value)} required rows={3} cols={20} />
                            </div>
                            <div className="field">
                                <label className="font-bold">
                                    Upload
                                </label><br/>
                                <UploadComponent setFile={functionToSetFiles} type={"giwaxs_files"} />
                            </div>
                            <div>
                                <label className="font-bold">
                                    Uploaded Files
                                </label><br/>
                                <div>
                                    { formData?.["giwaxs_files"]?.map(  val => <div>
                                        <li>
                                            <a href={val?.url}>{val?.name}</a>{val?.name.endsWith('.csv') && (
                                            <CsvDialogButton url={val?.url}  experiment_name={val?.experiment_name} experiment_type="GIWAXS (NSLS II)"/>
                                        )}
                                        </li>
                                    </div>) }
                                </div>
                            </div>
                            {/*<Button label="Submit" onClick={saveProduct}/>*/}
                            <Button label="Submit" onClick={()=>saveProduct(allTypes[3])}/>
                        </div>
                    </TabPanel>
                    <TabPanel header="SKPM (UW)">
                        <div>
                            <div className="field">
                                <label className="font-bold">
                                    Instrument Info
                                </label><br/>
                                <InputTextarea name='skpm_instrument' autoResize value={formData?.skpm_instrument} onChange={e=> setFormDataValue(e.target.name, e.target.value)} required rows={3} cols={20} />
                            </div>
                            <div className="field">
                                <label className="font-bold">
                                    Output Format
                                </label><br/>
                                <InputTextarea name='skpm_format' autoResize value={formData?.skpm_thickness_format} onChange={e=> setFormDataValue(e.target.name, e.target.value)} required rows={3} cols={20} />
                            </div>
                            <div className="field">
                                <label className="font-bold">
                                    Features to be extracted
                                </label><br/>
                                <InputTextarea name='skpm_features' autoResize value={formData?.skpm_features} onChange={e=> setFormDataValue(e.target.name, e.target.value)} required rows={3} cols={20} />
                            </div>
                            <div className="field">
                                <label className="font-bold">
                                    Upload
                                </label><br/>
                                <UploadComponent setFile={functionToSetFiles} type={"skpm_files"} />
                            </div>
                            <div>
                                <label className="font-bold">
                                    Uploaded Files
                                </label><br/>
                                <div>
                                    { formData?.["skpm_files"]?.map(val => <div>
                                        <li>
                                            <a href={val?.url}>{val?.name}</a>{val?.name.endsWith('.csv') && (
                                                <CsvDialogButton url={val?.url}  experiment_name={val?.experiment_name} experiment_type="SKPM (UW)"/>
                                            )}
                                        </li>
                                    </div>) }
                                </div>
                            </div>
                            {/*<Button label="Submit" onClick={saveProduct}/>*/}
                            <Button label="Submit" onClick={()=>saveProduct(allTypes[4])}/>
                        </div>
                    </TabPanel>
                </TabView>
            </Dialog>
        </div>

    )

}