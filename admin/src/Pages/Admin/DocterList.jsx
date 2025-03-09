import { useEffect, useState, useContext } from "react";
import { AdminContext } from "../../context/AdminContext";
import axios from "axios";

const DocterList =( )=>{

const {doctors, aToken,getAllDoctors} =useContext(AdminContext)

useEffect(()=>{
  if(aToken){
    getAllDoctors()
  }
},[aToken])

return (

  <div>
    <h1>All Doctors</h1>
    <div>
      {
        doctors.map((item,index)=>(
          <div key={index}>
            <img src={item} alt=""/>

            </div>
        ))
      }
    </div>
  </div>
)
}

export default DocterList;
