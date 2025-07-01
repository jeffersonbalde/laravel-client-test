import React from 'react'

export const token = () => {
    const userInfo = localStorage.getItem("userInfo");
    const data = JSON.parse(userInfo);
    return data.token;
}