
import { useState, useEffect, useMemo } from "react";
import {
    ref,
    uploadBytes,
    getDownloadURL,
    listAll,
    list,
} from "firebase/storage";
import {useDropzone} from 'react-dropzone';

import { storage } from "../../firebase";
import { v4 } from "uuid";

const baseStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    borderWidth: 2,
    borderRadius: 2,
    borderColor: '#eeeeee',
    borderStyle: 'dashed',
    backgroundColor: '#fafafa',
    color: '#bdbdbd',
    outline: 'none',
    transition: 'border .24s ease-in-out'
};

const focusedStyle = {
    borderColor: '#2196f3'
};

const acceptStyle = {
    borderColor: '#00e676'
};

const rejectStyle = {
    borderColor: '#ff1744'
};

function UploadComponent({ setFile, type }) {
   // const [imageUpload, setImageUpload] = useState(null);
    const [imageUrls, setImageUrls] = useState([]);
    const {acceptedFiles, getRootProps, getInputProps,   isFocused,
        isDragAccept,
        isDragReject} = useDropzone();


    const style = useMemo(() => ({
        ...baseStyle,
        ...(isFocused ? focusedStyle : {}),
        ...(isDragAccept ? acceptStyle : {}),
        ...(isDragReject ? rejectStyle : {})
    }), [
        isFocused,
        isDragAccept,
        isDragReject
    ]);
    const imagesListRef = ref(storage, "images/");

    useEffect(() => {
        console.log("useEffect called");
        setFile( acceptedFiles, type)
    },[acceptedFiles])

    const files = acceptedFiles.map(file => (
        <li key={file?.path}>
            {file?.path} - {file?.size} bytes
            <br/>

            {file?.type?.split("/")?.[0]==="image" && <img style={{ maxWidth : '100px', maxHeight : '100px' }} src={URL.createObjectURL(file)} alt="Image" />}
            {/*// <img style={{ maxWidth : '100px', maxHeight : '100px' }} src={URL.createObjectURL(file)} alt="Image" />*/}
        </li>
    ));



    return (
        <div className="App">
            <section className="container">
                <div {...getRootProps({className: 'dropzone', style : style })}>
                    <input {...getInputProps()} />
                    <p>Drag 'n' drop some files here, or click to select files</p>
                </div>
                <aside>
                    <h4>Files</h4>
                    <ul>{files}</ul>
                </aside>
            </section>
            {/*<button onClick={uploadFile}> Upload Image</button>*/}

        </div>
    );
}

export default UploadComponent;