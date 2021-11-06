import IMFContact from "../datatype/IMFContact";

export type ReverseIndex = { [handle: string]: string };

interface ContactGetter {
    getContacts: () => Promise<IMFContact[]>;
    close: () => void;
}

export default ContactGetter;
