import { encrypt, decrypt } from "../utils/encrypt";

const language_key = 'lang';
export const getLanguage = (_default='en-US') =>{
    // console.log('localStorage.getItem(language_key) || _default ======>', localStorage.getItem(language_key) || _default)
    return localStorage.getItem(language_key) || _default;
}
export const setLanguage = (lang) =>{
    return localStorage.setItem(language_key, lang);
}

const version_key = 'version';
export const getVersion = (_default) =>{
    // console.log('localStorage.getItem(language_key) || _default ======>', localStorage.getItem(language_key) || _default)
    return localStorage.getItem(version_key) || _default;
}
export const setVersion = (version) =>{
    return localStorage.setItem(version_key, version);
}
/**
 *
 * @param {String} area
 */
export function getStorage (area, secret='insecure') {
    return new Promise(async(res, rej) =>   {
        try {
            let rawData = localStorage.getItem(area);
            // console.log(' >> localStorage.js << :: getStorage => ', ' | area:', area, ' | rawData:', rawData);
            if(rawData===null)
            {
                // rej({error:'no_item'});
                res({error:'no_item'});
                return;
            }
            if(secret) {
                rawData = await decrypt(rawData, secret)
            }
            const data = JSON.parse(rawData);
            res({data});
        }
        catch (error) {
            console.error('Read localStorage', error)
            res({error})
        }
    })
}

/**
 *  @param {String} area
 *  @param {Object} data
 */
export function setStorage (area, data, secret='insecure') {
    return new Promise(async(res, rej)=>{
        try {
            let rawData = JSON.stringify(data)
            if (secret) {
                rawData = await encrypt(data, secret)
            }
            localStorage.setItem(area, rawData)
            res({status: 'ok'})
        } catch (error) {
            rej(error);
        }
    })
}

/**
 *  @param {String} area
 */
export function deleteStorage (area) {
    return new Promise((res, rej)=>{
            localStorage.removeItem(area)
            res({status: 'ok'})
    })
}

export function clearStorage () {
    return new Promise((res, rej)=>{
            localStorage.clear()
            res({status: 'ok'})
    })
}