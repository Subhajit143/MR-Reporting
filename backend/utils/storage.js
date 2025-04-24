import { Storage } from '@capacitor/storage';
import { Capacitor } from '@capacitor/core';

export const  setStorageItem = async (key,value)=>{
    if (Capacitor.isNativePlatform()){
        await Storage.set({key,value: JSON.stringify(value)})
    }else{
        localStorage.setItem(key,JSON.stringify(value))
    }
}

export const getStorageItem = async (key)=>{
    if(Capacitor.isNativePlatform()){
        const {value}=await Storage.get({key})
        return value ? JSON.parse(value): null
    } else {
        return JSON.parse(localStorage.getItem(key))
    }
}

export const removeStorageItem =async (key)=>{
    if (Capacitor.isNativePlatform()){
        await Storage.remove({key})
    }else {
        localStorage.removeItem(key)
    }
}