// /BACKEND/controller/utils/Otp.utils.js

import axios from "axios";


//Api for invoking otp api. I am using gooadvert sms api service

  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  };

 export const SendOtp = async (req, res) => {

  
    const otpCode = generateOTP();
    setGeneratedOtp(otpCode);
  

    const message = `Dear user, your OTP for Vikalpa Account Sign-up is: ${otpCode}. Please do not share it with anyone. Vikalpa.`;

    const url = `http://sms.gooadvert.com/api/mt/SendSMS?APIKey=e3744d6493af43768cc71287368c1293&senderid=VIKLPA&channel=Trans&DCS=0&flashsms=0&number=91${formData.contact1}&text=${encodeURIComponent(message)}&route=5&PEId=1401539030000072375`;



    try {
        
        const response = await axios.get(url)
        console.log(response)

    } catch (error) {
        console.log('error sending otp')
    }
 }
