import { Button } from 'primereact/button';
import React, {useContext, useEffect, useRef, useState} from 'react';
import { UserContext } from '../contexts/user.context';
import {Toast} from "primereact/toast";
import DataTable, { FilterComponent } from 'react-data-table-component';
import {Toolbar} from "primereact/toolbar";
//import {Column} from "primereact/column";
import {QRCodeViewer} from "../dialogs/QRCodeViewer";
import {QRScanner} from "../dialogs/QRScanner.dialog";
import {UpdateProductInfo} from "../dialogs/Form.dialog";
import {InputText} from "primereact/inputtext";
import {DataForm} from "../dialogs/NewProduct.dialog";
import {ChartMaker} from "../dialogs/ChartMaker";



export default function Home() {
    const { logOutUser, user} = useContext(UserContext);
    const toast = useRef(null);
    const [products, setProducts] = useState([]);

    const [filterText, setFilterText] = React.useState('');
    const [resetPaginationToggle, setResetPaginationToggle] = React.useState(false);

    const FilterComponent = ({ filterText, onFilter, onClear }) => {
        const [filterValueData, setFilterValueData] = useState(filterText);
        return (


            <span className="p-input-icon-right ">
                <div className={"flex flex-wrap gap-2"}>
                    <Button icon="pi pi-refresh" onClick={tableDataFetch} />
        		<InputText
                    id="search"
                    type="text"
                    placeholder="Filter by ID or Experiment Name"
                    aria-label="Search Input"
                    value={filterValueData}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter')
                            onFilter(filterValueData)
                    }  }
                    onChange={(e)=>setFilterValueData(e.target.value)}
                />

                </div>
    	</span>)
    };

    const subHeaderComponentMemo = React.useMemo(() => {
        const handleClear = () => {
            if (filterText) {
                setResetPaginationToggle(!resetPaginationToggle);
                setFilterText('');
            }
        };

        return (
            <FilterComponent onFilter={e => setFilterText(e)} onClear={handleClear} filterText={filterText} />
        );
    }, [filterText, resetPaginationToggle]);

    const columns = [{
        id : 'id',
        name : 'ID',
        selector : row => row?._id.toHexString(),
    },{
        id : 'name',
        name : 'Experiment name',
        selector : row => row?.experiment_name,
    },{
        id : 'date',
        name : 'Date and Time',
        selector : row => row?.experiment_dt.toString(),
    },{
        id : 'location',
        name : 'Location',
        selector : row => row?.experiment_location,
    },{
        id : 'user',
        name : 'User',
        selector : row => row?.user,
    },{
        id : 'actionBodyTemplate',
        name : '',
        cell : (rowData) => actionBodyTemplate(rowData),
    }]

    // This function is called when the user clicks the "Logout" button.
    const logOut = async () => {
        try {
            // Calling the logOutUser function from the user context.
            const loggedOut = await logOutUser();
            // Now we will refresh the page, and the user will be logged out and
            // redirected to the login page because of the <PrivateRoute /> component.
            if (loggedOut) {
                window.location.reload(true);
            }
        } catch (error) {
            alert(error)
        }


    }

    useEffect(() => {
        //ProductService.getProducts().then((data) => setProducts(data));
        const initialFunctionCall = async () => {
            if(filterText){
                try{
                    const functionName = "getProductIdInfo";
                    const data = await user.callFunction(functionName, filterText)
                    console.log(data);
                    setProducts(data);
                } catch(e){
                    setProducts([])
                }


            }else{
                try{
                    await tableDataFetch();
                }catch (e){
                    toast.current.show({severity: 'error', summary: 'Error Message', detail: 'Error while fetching data', life: 3000});
                }
            }


        }
        initialFunctionCall();
    }, [filterText]);

    const tableDataFetch = async () => {

        const functionName = "getLast30";
        const data = await user.callFunction(functionName)
        setProducts(data);
    }

    const leftToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2">

                {/*<Button label="New" icon="pi pi-plus" severity="success" onClick={openNew} />*/}
                {/*<NewProduct />*/}
                <DataForm />
                <QRScanner setGlobalFilter={(e)=>setFilterText(e)} />
                <ChartMaker />

            </div>
        );
    };

    const rightToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2">

                <Button variant="contained" onClick={logOut}>Logout</Button>

            </div>
        );
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <React.Fragment>
                {console.log(rowData)}
                {/*<Button icon="pi pi-plus" rounded outlined className="mr-2" onClick={() => addProductInfo(rowData)} />*/}
                <UpdateProductInfo rowData = {rowData} />
                <QRCodeViewer rowData={rowData}/>
            </React.Fragment>
        );
    };


    return (
        <>
            <Toast ref={toast} />
            <div className="card">
                <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>
                <DataTable
                    title="Data"
                    columns={columns}
                    data={products}
                    subHeader
                    subHeaderComponent={subHeaderComponentMemo}
                    paginationResetDefaultPage={resetPaginationToggle}

                     pagination
                />

            </div>
        </>
    )
}