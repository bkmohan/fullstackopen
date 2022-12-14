import axios from "axios";
const baseURL = 'http://localhost:3001/persons'


const getAll = () => {
    const request = axios.get(baseURL)
    return request.then(response => response.data)
}

const create = newContact => {
    const request =  axios.post(baseURL, newContact)
    return request.then(response => response.data)
}

const update = (id, newContact) => {
    const request =  axios.put(`${baseURL}/${id}`, newContact)
    return request.then(response => response.data)
}

const delContact = (id) => {
    const request = axios.delete(`${baseURL}/${id}`)
    return request
}


export default {getAll, create, update, delContact};
