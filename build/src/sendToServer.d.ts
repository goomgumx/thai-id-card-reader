interface cardData {
    citizenId: string;
    titleTH: string;
    firstNameTH: string;
    lastNameTH: string;
    titleEN: string;
    firstNameEN: string;
    lastNameEN: string;
    birthday: string;
    gender: string;
    address: string;
    issue: string;
    expire: string;
    photo: string;
}
export default function sendToServer(data: cardData): null | undefined;
export {};
