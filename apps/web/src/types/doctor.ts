export interface IDoctor {
    _id?: string;
    docImg: string;
    docName: string;
    department: string;
    YOE: number;
    availability: boolean;
    about: string;
    availableTime: {
    day: string;
    start: string;
    end: string;
    }[];
    gender?: "male" | "female" ;
}