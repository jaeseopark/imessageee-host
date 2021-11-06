import IMFContact from "../datatype/IMFContact";

export type Contact = { alias: string; handles: string[]; };
export type ReverseLookp = { [handle: string]: string };

interface ContactGetter {
    getContacts: () => Promise<IMFContact[]>;
    close: () => void;
}

export default ContactGetter;
