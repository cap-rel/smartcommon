export const COMPONENTS_MAP = {
    boolean      : "boolean" ,       // return(boolean:boolean)
    checkbox     : "checkbox", // return([option1, ...])
    select       : "select",   // return("select")
    radio        : "radio",   // return("radio")
    chkbxlst     : "MultiCheckbox", // return([option1, ...])
    sellist      : "MultiSelect", // return([option1, ...])
    varchar      : "varchar",        // return("varchar") | type => varchar(max)
    mail         : "email",          // return("mail")
    password     : "password",       // return(!)
    phone        : "phone",          // return(phone:number)
    url          : "url",            // return("url")
    ip           : "ip",             // return("ip")
    link         : "link",           // return({ id, object) | lien vers un objet
    timestamp    : "timestamp",      // return(timestamp:number)
    date         : "date",           // return(timestamp:number)
    datetime     : "datetime",       // return(timestamp:number)
    integer      : "integer",        // return(integer:number)
    stock        : "stock",          // return(stock:number)
    real         : "float",          // return(real:number(float)) | TODO renommer reel
    price        : "price",          // return(price:number(float))
    pricecy      : "priceCurrency",         // return("price:currency") | TODO renommer pricecy
    stars        : "rating",         // return(rating:number)
    duration     : "duration",       // return(duration(seconds):number)
    double       : "double",         // return(double:number(float)) | type => double(before, after) | TODO remonner double
    text         : "text",           // return("text")
    html         : "html",           // return("html")
    point        : "gpsPoints",      // return([longitude, latitude])
    multipts     : "multiGpsPoints", // return([[loingitude, latitude], [...]])
    icon         : "icon",           // return("fa fa-user fa-xl")
    
    range        : "range",          // TODO à développer sur DOLIBARR ?
    array        : "array",          // TODO à développer sur DOLIBARR ?
    time         : "time",           // TODO à développer sur DOLIBARR ?
    color        : "color",          // TODO à développer sur DOLIBARR ?

    address      : "address",        // TODO à développer sur DOLIBARR
    files        : "files",          // TODO à développer sur DOLIBARR
    audios       : "audios",         // TODO à développer sur DOLIBARR
    videos       : "videos",         // TODO à développer sur DOLIBARR
    photos       : "photos",         // TODO à développer sur DOLIBARR
    signature    : "signature",      // TODO à développer sur DOLIBARR
    drawing      : "drawing",        // TODO à développer sur DOLIBARR
};
