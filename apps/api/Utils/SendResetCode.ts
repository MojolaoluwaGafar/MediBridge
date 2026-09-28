import {SendEmail} from "../Utils/SendMail"
import { ResetTemplate } from "../MailTemplates/CodeReq";



export const sendResetCode = (email: string, FirstName: string, code: string)=>{
    const subject = "Your Activation Code";
    const html = ResetTemplate(FirstName, code)

   return SendEmail({ to : email, subject, html})
}


