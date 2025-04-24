export function generateOTP(){
    return Math.floor(10000 + Math.random()*900000).toString();
}

export function sendOTPToPhone(phone,otp){
    console.log(`OTP For ${phone} is ${otp}`);
    
}