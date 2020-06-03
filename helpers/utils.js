export default function renderSOStatus(SOStatusEnum: Number) {
    let sostatusstr = "";
    if (SOStatusEnum === null) {
        return sostatusstr;
    }
    let sostatus = SOStatusEnum;
    switch (sostatus) {
        case 0:
            sostatusstr = "待审核";
            break;
        case 10:
            sostatusstr = "已支付";
            break;
        case 20:
            sostatusstr = "已拆分";
            break;
        case 25:
            sostatusstr = "审核拒绝";
            break;
        case 30:
            sostatusstr = "已审核";
            break;
        case 35:
            sostatusstr = "已分配";
            break;
        case 40:
            sostatusstr = "已出库";
            break;
        case 50:
            sostatusstr = "已完成";
            break;
        case -1:
            sostatusstr = "已取消";
            break;
        default:
            sostatusstr = "未知";
            break;
    }
    return sostatusstr;
};

/**
 * 
 * @param { 传入数组 } joinArrary 
 * @param { 分隔字符 } type 
 */
export function joinstr(joinArrary: Array, type: String = ", ") {
    if (joinArrary.length > 0) {
        let temparrary = joinArrary.filter((value, index) => {
            return value !== null && value !== "" && typeof value !== "undefined";
        });
        return temparrary.join(type);
    } else {
        return;
    }
}
 
export function GetCompanyID() {
	let authentication = global.AppAuthentication;
	if (authentication) {
		return authid = authentication.AppCompanySysNo;
	}
	return CompanyAppConfig.CompanyID;
}

export function formatStr(name: String, number: Number) {
    if (name.length > number) {
        return name.substr(0, number) + "...";
    } else {
        return name;
    }
}


export function calcImagesScale(width:Number,heigth:Number,screenWidth:Number,screeenHeigth:Number) {
    let widthScale = 0;
    let heigthScale = 0;
    if(width<=0||heigth<=0||screenWidth<=0||screeenHeigth<=0){
        return 1;
    }
    if(screenWidth/width - screeenHeigth/heigth<=0){
        return width/screenWidth
    }else{
        return heigth/screeenHeigth
    }
}