// EmployerContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApis, endpoints } from './Apis';
import MyUserContext from './Contexts'; // Ké cái user context để check role

export const EmployerContext = createContext();

export const EmployerProvider = ({ children }) => {
    const [user] = useContext(MyUserContext); // Rình xem user nào đang đăng nhập
    const [company, setCompany] = useState(null);
    const [employerJobs, setEmployerJobs] = useState([]);
    const [employerStats, setEmployerStats] = useState({ totalJobs: 0, totalApplicants: 0, conversionRate: 0 });

    // TỰ ĐỘNG KÉO DATA CÔNG TY KHI USER ĐĂNG NHẬP LÀ EMPLOYER
    useEffect(() => {
        const loadCompanyAutomatically = async () => {
            if (user && user.role === 'employer') {
                try {
                    const token = await AsyncStorage.getItem('token');
                    let companyRes = await authApis(token).get(endpoints['current-company']);
                    if (companyRes.data) {
                        setCompany(companyRes.data); // Có công ty thì nạp vô kho liền
                    }
                } catch (error) {
                    console.log("Tài khoản Employer này chưa đăng ký thông tin công ty.");
                    setCompany(null); // Chưa có thì để null để sang màn Profile bắt đăng ký
                }
            } else if (!user) {
                // Nếu user logout -> Xóa sạch kho dữ liệu Employer liền cho an toàn
                setCompany(null);
                setEmployerJobs([]);
                setEmployerStats({ totalJobs: 0, totalApplicants: 0, conversionRate: 0 });
            }
        };

        loadCompanyAutomatically();
    }, [user]); // Mỗi lần user thay đổi (đăng nhập/đăng xuất) là cái này tự chạy

    return (
        <EmployerContext.Provider value={{ 
            company, setCompany, 
            employerJobs, setEmployerJobs, 
            employerStats, setEmployerStats 
        }}>
            {children}
        </EmployerContext.Provider>
    );
};