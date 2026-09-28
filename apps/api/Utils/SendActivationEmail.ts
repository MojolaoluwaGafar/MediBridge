import { SendEmail } from "../Utils/SendMail"
import { ActivationTemplate } from "../MailTemplates/Activate";

export const sendActivationCode = (email: string, FirstName: string, code: string)=>{
    const subject = "Your Activation Code";
    const html = ActivationTemplate(FirstName, code)

   return SendEmail({ to : email, subject, html})
}
