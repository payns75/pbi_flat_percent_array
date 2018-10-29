module powerbi.extensibility.visual {
    "use strict";
    import DataViewObjectsParser = powerbi.extensibility.utils.dataview.DataViewObjectsParser;

    export class VisualSettings extends DataViewObjectsParser {
      public display: displaySettings = new displaySettings();
      }

    export class displaySettings {
      public percent: boolean = false;
      public zoom: string = "0.7";
      public overflow: boolean = false;
      public category_margin: number = 4;
      public justify_content: string = "space-between";
      public align_content: string = "center";
     }
}
