import parsePhoneNumber from 'libphonenumber-js'
import ContactGetter, { Contact, ReverseLookp } from "./interface/ContactGetter";
import FSAdapter from "./interface/FSAdapter";
import { ICloudHandlerFactory } from "./interface/ICloudHandlerFactory";

const APP_DIR = "~/.imf/contacts";
const CONTACT_CACHE_PATH = "contacts.json";
const CONTACT_REVERSE_CACHE_PATH = "contacts_reverse.json";

class ContactsApp extends FSAdapter {
    contactGetter: ContactGetter;
    contacts: Contact[] = [];
    reverseLookup: ReverseLookp = {};

    constructor(iCloudHandlerFactory: ICloudHandlerFactory) {
        super(APP_DIR);
        this.contactGetter = iCloudHandlerFactory.getContactGetter();
    }

    initialize = async () => {
        this.contacts = this.readJson(CONTACT_CACHE_PATH) || [];
        this.reverseLookup = this.readJson(CONTACT_REVERSE_CACHE_PATH) || {};

        return this.contactGetter
            .getContacts()
            .then(contacts => {
                this.writeJson(CONTACT_CACHE_PATH, contacts);
                return contacts;
            })
            .then((contacts) =>
                contacts.reduce((acc: ReverseLookp, contact) => {
                    contact.handles
                        .filter(handle => handle)
                        .forEach((handle) => {
                            acc[handle] = contact.name;
                        });
                    return acc;
                }, {}))
            .then((reverseLookup) => {
                this.writeJson(CONTACT_REVERSE_CACHE_PATH, reverseLookup);
                this.reverseLookup = reverseLookup;
            });
    }

    normalizeContactLookup = (reverseLookup: ReverseLookp) => {
        const defaultCountry = "US";
        const normalized: ReverseLookp = {};
        Object.entries(reverseLookup).forEach(([handle, alias]) => {
            const isEmail = handle.includes("@");
            if (isEmail) {
                normalized[handle] = alias;
                return;
            }

            const phoneNumber = parsePhoneNumber(handle, defaultCountry);
            if (phoneNumber) {
                const normalizedHandle = phoneNumber.formatInternational().replace(/ /g, "");
                normalized[normalizedHandle] = alias;
            } else {
                normalized[handle] = alias;
            }
        });

        return normalized;
    }

    getAliasByHandle = (handle: string) => this.reverseLookup[handle];

    isReady = () => Object.keys(this.reverseLookup).length > 0;
}

export default ContactsApp;
