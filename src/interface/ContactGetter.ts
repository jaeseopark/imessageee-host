import IMFContact from "../datatype/IMFContact";

export type ReverseLookp = { [handle: string]: string };

interface ContactGetter {
    getContacts: () => Promise<IMFContact[]>;
    getReverseLookup: () => Promise<ReverseLookp>;
    close: () => void;
}

export default ContactGetter;
