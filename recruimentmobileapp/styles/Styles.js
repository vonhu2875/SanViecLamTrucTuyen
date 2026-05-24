import { StyleSheet } from "react-native";

const Styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFF0F2',
    },
    container: 
    { 
        flexGrow: 1,
        justifyContent: 'center',
    },
    formContainer: {
         padding: 20,
         justifyContent: 'center',
    },
    logoIcon: {
        width: 80,
        height: 80,
        alignSelf: 'center',
        resizeMode: 'contain'
    },
    title: { 
        marginTop: 15,
        fontSize: 32, 
        fontWeight: 'bold', 
        color: '#F2A0B6', 
        textAlign: 'center', 
        letterSpacing: 1.5,
    },
    subtitle: { 
        fontSize: 14, 
        color: 'gray', 
        textAlign: 'center', 
        marginBottom: 40, 
        marginTop: 5 
    },
    input: { 
        marginBottom: 15, 
        backgroundColor: '#fff',
        
    },
    button: {
        marginTop: 10, 
        paddingVertical: 5,
        backgroundColor: '#F2A0B9',
    },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    registerText: {
        color: '#666',
        fontSize: 14,
    },
    registerLink: {
        color: '#F2A0B6',
        fontWeight: 'bold',
        fontSize: 14,
    },
    guestContainer: 
    {
        alignItems: 'center',
        marginTop: 15,
    },
    guestLink: {
        color: '#666',
        textDecorationLine: 'underline',
        fontSize: 14,
    }
});

export default Styles;