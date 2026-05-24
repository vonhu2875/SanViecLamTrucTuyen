const MyUserReducer = (currentState, action) => {
    switch (action.type) {
        case "LOGIN":
            return action.payload; // Đăng nhập thành công thì nạp user vào
        case "LOGOUT":
            return null; // Đăng xuất thì xóa sạch về null
        default:
            return currentState;
    }
}

export default MyUserReducer;