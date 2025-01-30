import { isUndefined } from "../../functions";

export function setComponent(type) {
    const COMPONENTS_MAP = {
        boolean      : { type: "boolean", variant: "switch" },          // return(boolean:boolean)
        checkbox     : { type: "multiSelection", variant: "checkbox" }, // return([option1, ...])
        select       : { type: "oneSelection", variant: "select" },     // return("select")
        radio        : { type: "oneSelection", variant: "radio" },      // return("radio")
        chkbxlst     : { type: "multiSelection", variant: "checkbox" }, // return([option1, ...])
        sellist      : { type: "multiSelection", variant: "select" },   // return([option1, ...])
        varchar      : { type: "varchar" },                             // return("varchar") | type => varchar(max)
        mail         : { type: "mail" },                                // return("mail")
        password     : { type: "password" },                            // return(!)
        phone        : { type: "phone" },                               // return(phone:number)
        url          : { type: "url" },                                 // return("url")
        ip           : { type: "ip" },                                  // return("ip")
        link         : { type: "link" },                                // return({ id, object }) | lien vers un objet
        timestamp    : { type: "timestamp" },                           // return(timestamp:number)
        date         : { type: "date" },                                // return(timestamp:number)
        datetime     : { type: "datetime" },                            // return(timestamp:number)
        integer      : { type: "int" },                                 // return(integer:number)
        stock        : { type: "stock" },                               // return(stock:number)
        real         : { type: "reel" },                                // return(real:number(float)) | TODO renommer reel
        price        : { type: "price" },                               // return(price:number(float))
        pricecy      : { type: "pricey" },                              // return("price:currency")
        stars        : { type: "rating" },                              // return(rating:number)
        range        : { type: "" },
        duration     : { type: "duration" },                            // return(duration(seconds):number)
        double       : { type: "double" },                              // return(double:number(float)) | type => double(before, after) | TODO remonner double
        text         : { type: "text" },                                // return("text")
        html         : { type: "html" },                                // return("html")
        point        : { type: "gps" },                                 // return([longitude, latitude])
        multipts     : { type: "multiGPS" },                            // return([[loingitude, latitude], [...]])
        icon         : { type: "icon" },                                // return("fa fa-user fa-xl")
        
        address      : { type: "" }, // TODO à développer sur DOLIBARR
        files        : { type: "" }, // TODO à développer sur DOLIBARR
        audios       : { type: "" }, // TODO à développer sur DOLIBARR
        videos       : { type: "" }, // TODO à développer sur DOLIBARR
        photos       : { type: "" }, // TODO à développer sur DOLIBARR
        signature    : { type: "" }, // TODO à développer sur DOLIBARR
        drawing      : { type: "" }, // TODO à développer sur DOLIBARR
        
        array        : { type: "" }, // TODO à supprimer
        time         : { type: "" }, // TODO à supprimer
        color        : { type: "" }, // TODO à supprimer
    };
    
    if (isUndefined(COMPONENTS_MAP[type])) {
        console.error(`${type} n'est pas un type valide.`);
        return;
    }

    return COMPONENTS_MAP[type];
};