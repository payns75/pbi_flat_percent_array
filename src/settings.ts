module powerbi.extensibility.visual {
    "use strict";
    import DataViewObjectsParser = powerbi.extensibility.utils.dataview.DataViewObjectsParser;

    export class VisualSettings extends DataViewObjectsParser {
      public display: displaySettings = new displaySettings();
      }

    export class displaySettings {
      public zoom: string = "0.7";
      public overflow: boolean = false;
     }
}
