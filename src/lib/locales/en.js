// English locale bundle.
//
// This file is the SOURCE OF TRUTH: it imports the DEFAULT_LABELS exported
// by each component's props.js (or labels.js for service modules) and
// reshapes them into a single object keyed by component name. All other
// locale files (fr, de, es, it, pl, nl, pt) MUST mirror this shape:
// same keys, same function signatures, same number of arguments.
//
// Consumer usage:
//   import { en } from "@cap-rel/smartcommon/locales";
//   <PhotosUploader labels={en.PhotosUploader} />

import { DEFAULT_LABELS as PhotosUploader } from "lib/components/form/PhotosUploader/props";
import { DEFAULT_LABELS as VideosUploader } from "lib/components/form/VideosUploader/props";
import { DEFAULT_LABELS as AudiosUploader } from "lib/components/form/AudiosUploader/props";
import { DEFAULT_LABELS as SignaturePad } from "lib/components/form/SignaturePad/props";
import { DEFAULT_LABELS as BooleanLabels } from "lib/components/form/Boolean/props";
import { DEFAULT_LABELS as Checker } from "lib/components/form/Checker/props";
import { DEFAULT_LABELS as RadioBar } from "lib/components/form/RadioBar/props";
import { DEFAULT_LABELS as Select } from "lib/components/form/Select/props";
import { DEFAULT_LABELS as Gps } from "lib/components/form/Gps/props";
import { DEFAULT_LABELS as PlainCalendar } from "lib/components/form/PlainCalendar/props";
import { DEFAULT_LABELS as NumericPad } from "lib/components/form/NumericPad/props";
import { DEFAULT_LABELS as MapLabels } from "lib/components/others/Map/props";
import { DEFAULT_LABELS as Stepper } from "lib/components/others/Stepper/props";
import { DEFAULT_LABELS as ProductCategoryBrowser } from "lib/components/others/ProductCategoryBrowser/props";
import { DEFAULT_LABELS as PhotoAnnotator } from "lib/components/others/PhotoAnnotator/props";
import { DEFAULT_LABELS as PhotoEditor } from "lib/components/others/PhotoEditor/props";
import { DEFAULT_LABELS as LoginComponent } from "lib/components/others/LoginComponent/props";
import { DEFAULT_LABELS as DevicePicker } from "lib/components/others/DevicePicker/props";
import { DEFAULT_LABELS as DeviceIdentificationComponent } from "lib/components/others/DeviceIdentificationComponent/props";
import { DEFAULT_LABELS as DataTable } from "lib/components/others/DataTable/props";
import { DEFAULT_LABELS as BarcodeScanner } from "lib/components/others/BarcodeScanner/props";
import { DEFAULT_LABELS as AboutModal } from "lib/components/others/AboutModal/props";
import { DEFAULT_LABELS as NotificationToggle } from "lib/components/others/NotificationToggle/props";
import { DEFAULT_LABELS as Files } from "lib/components/formats/Files/props";
import { DEFAULT_LABELS as UpdatePrompt } from "lib/components/app/UpdatePrompt/props";
import { DEFAULT_LABELS as ViewportProvider } from "lib/components/app/ViewportProvider/props";
import { DEFAULT_LABELS as Print } from "lib/print/labels";

export const en = {
    PhotosUploader,
    VideosUploader,
    AudiosUploader,
    SignaturePad,
    Boolean: BooleanLabels,
    Checker,
    RadioBar,
    Select,
    Gps,
    PlainCalendar,
    NumericPad,
    Map: MapLabels,
    Stepper,
    ProductCategoryBrowser,
    PhotoAnnotator,
    PhotoEditor,
    LoginComponent,
    DevicePicker,
    DeviceIdentificationComponent,
    DataTable,
    BarcodeScanner,
    AboutModal,
    NotificationToggle,
    Files,
    UpdatePrompt,
    ViewportProvider,
    Print,
};

export default en;
