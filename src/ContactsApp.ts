import parsePhoneNumber from 'libphonenumber-js'
import IMFContact from './datatype/IMFContact';
import IMFEvent from './datatype/IMFEvent';
import ContactGetter, { ReverseIndex } from "./interface/ContactGetter";
import FSAdapter from "./interface/FSAdapter";
import { ICloudHandlerFactory } from "./interface/ICloudHandlerFactory";

const APP_DIR = "~/.imf/contacts";
const CONTACT_CACHE_PATH = "cached.json";
const CONTACT_REVERSE_CACHE_PATH = "cached_reverse.json";

const DEFAULT_COUNTRY = "US";

const normalizeHandle = (handle: string) => {
    const isPhone = !handle.includes("@");
    if (isPhone) {
        const phoneNumber = parsePhoneNumber(handle, DEFAULT_COUNTRY);
        if (phoneNumber) {
            return phoneNumber.formatInternational().replace(/ /g, "");
        }
    }
    return handle;
}

class ContactsApp extends FSAdapter {
    contactGetter: ContactGetter;
    contacts: IMFContact[] = [];
    reverseIndex: ReverseIndex = {};

    constructor(iCloudHandlerFactory: ICloudHandlerFactory) {
        super(APP_DIR);
        this.contactGetter = iCloudHandlerFactory.getContactGetter();

        this.contacts = this.readJson(CONTACT_CACHE_PATH) || [];
        this.reverseIndex = this.readJson(CONTACT_REVERSE_CACHE_PATH) || {};
    }

    initialize = () => this.contactGetter
        .getContacts()
        .then((contacts) => contacts.map(({ name, handles }) => ({
            name,
            handles: handles.filter(handle => handle).map(normalizeHandle)
        })))
        .then((contacts) => {
            this.writeJson(CONTACT_CACHE_PATH, contacts);
            return contacts;
        })
        .then((contacts) =>
            contacts.reduce((acc: ReverseIndex, contact) => {
                contact.handles
                    .forEach((handle) => {
                        acc[handle] = contact.name;
                    });
                return acc;
            }, {}))
        .then((reverseIndex) => {
            this.writeJson(CONTACT_REVERSE_CACHE_PATH, reverseIndex);
            this.reverseIndex = reverseIndex;
        });

    getAliasByHandle = (handle: string) => this.reverseIndex[handle];

    getPreloadEvent = (): Promise<IMFEvent> => Promise.resolve({
        contacts: this.contacts,
        type: "CONTACTS"
    });

    isReady = () => Object.keys(this.reverseIndex).length > 0;
}

export default ContactsApp;
