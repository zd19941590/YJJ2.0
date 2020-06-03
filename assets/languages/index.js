/**
 * Created by jean.h.ma on 22/05/2017.
 */
import LocalizedStrings from 'react-localization';
import zhCN from './zh-CN.json'

const languages = {
	"zh-CN": zhCN
};

function hasLanguage(code) {
	for (let key in languages) {
		if (key === code) {
			return true;
		}
	}
	return false;
}

let strings = new LocalizedStrings(languages);

const interfaceLanguage = strings.getInterfaceLanguage();
if (hasLanguage(interfaceLanguage)) {
	strings.setLanguage(interfaceLanguage);
}
else {
	strings.setLanguage('zh-CN');
}

export default strings;