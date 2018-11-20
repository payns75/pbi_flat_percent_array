module powerbi.extensibility.visual {
    "use strict";
    export class Visual implements IVisual {
        private settings: VisualSettings;
        private container: HTMLElement;
        private target: HTMLElement;
        // private host: IVisualHost;
        // private selectionManager: ISelectionManager;

        constructor(options: VisualConstructorOptions) {
            try {
                // this.host = options.host;
                this.target = options.element;
                this.container = document.createElement("div");
                this.container.className = "container";
                this.target.appendChild(this.container);
                // this.selectionManager = this.host.createSelectionManager();
            }
            catch (ex) {
                console.error('Constructor Error', ex);
            }
        }

        public update(options: VisualUpdateOptions) {
            try {
                this.settings = Visual.parseSettings(options && options.dataViews && options.dataViews[0]);

                const gheight = options.viewport.height / (+this.settings.display.zoom);
                this.container.style.height = gheight.toString() + "px";

                const gwidth = options.viewport.width / (+this.settings.display.zoom);
                this.container.style.width = gwidth.toString() + "px";

                let categorical = options.dataViews[0].categorical;
                let category = categorical.categories[0];
                let subcategory = categorical.categories[1];
                let urls = categorical.categories[2];
                const multiplicateur = this.settings.display.percent ? 100 : 1;
                let value_text = Visual.getvalues(categorical, "value_text");
                let value_arc = Visual.getvalues(categorical, "value_arc");
                let vor_flag = Visual.getvalues(categorical, "vor_flag");
                let point_value = Visual.getvalues(categorical, "point_value");
                let point_total = Visual.getvalues(categorical, "point_total");
                let category_sort = Visual.getvalues(categorical, "category_sort");
                const data = [];
                // const _this = this;

                this.target.style.overflow = this.settings.display.overflow ? "auto" : "hidden";
                this.container.style.zoom = this.settings.display.zoom;
                this.container.style.justifyContent = this.settings.display.justify_content;
                this.container.style.alignContent = this.settings.display.align_content;

                const getvalue = (arr, index) => {
                    if (arr && arr.length > index) {
                        return arr[index];
                    }
                };

                for (let i = 0, len = category.values.length; i < len; i++) {

                    let cv_arc = getvalue(value_arc, i);
                    let cv_text = getvalue(value_text, i);

                    if (cv_text || cv_text === 0) {
                        cv_text = `${Math.round(+cv_text * multiplicateur)}%`
                    }

                    if (cv_arc) {
                        cv_arc = `${Math.round(+cv_arc * multiplicateur)}`
                    }

                    data.push({
                        category: category.values[i],
                        subcategory: subcategory.values[i],
                        url: urls && urls.values ? urls.values[i] : null,
                        category_sort: getvalue(category_sort, i),
                        value_text: cv_text,
                        value_arc: cv_arc,
                        vor_flag: getvalue(vor_flag, i),
                        point_value: getvalue(point_value, i),
                        point_total: getvalue(point_total, i)
                        // identity: this.host.createSelectionIdBuilder()
                        //     .withCategory(subcategory, i)
                        //     .createSelectionId(),
                    });
                }

                const groupBy = (array, prop) => {
                    return array.reduce(function (groups, item) {
                        const val = item[prop]
                        groups[val] = groups[val] || []
                        groups[val].push(item)
                        return groups
                    }, {})
                };

                var categories = groupBy(data, "category");

                // const selectclass = (el: HTMLElement, name: string, remove = false) => {
                //     if (el) {
                //         if (remove && el.classList.contains("category_item_selected")) {
                //             el.classList.remove("category_item_selected");
                //         }
                //         if (!remove && !el.classList.contains("category_item_selected")) {
                //             el.classList.add("category_item_selected");
                //         }
                //     }
                // }

                // const selectItems = (ids: any[]) => {
                //     for (let i = 0, len = Object.keys(categories).length; i < len; i++) {
                //         const cat = Object.keys(categories)[i];
                //         const len2 = categories[cat].length;

                //         for (let j = 0; j < len2; j++) {
                //             const item = categories[cat][j];

                //             if (ids.indexOf(item.identity) >= 0) {
                //                 selectclass(item.category_item, "category_item_selected");
                //             } else {
                //                 selectclass(item.category_item, "category_item_selected", true);
                //             }
                //         }
                //     }
                // };

                this.container.innerHTML = "";

                for (let i = 0, len = Object.keys(categories).length; i < len; i++) {
                    const cat = Object.keys(categories)[i];
                    const category_container: HTMLElement = document.createElement("div");
                    category_container.className = "category_container";
                    category_container.style.margin = `${this.settings.display.category_margin}px`;
                    const category_title: HTMLElement = document.createElement("div");
                    category_title.className = "category_title";
                    category_title.textContent = cat;
                    category_container.appendChild(category_title);
                    const category_content: HTMLElement = document.createElement("div");
                    category_content.className = "category_content";
                    category_container.appendChild(category_content);
                    this.container.appendChild(category_container);

                    const len2 = categories[cat].length;

                    if (len2 > 0) {
                        category_container.style.order = categories[cat][0].category_sort;
                    }

                    for (let j = 0; j < len2; j++) {
                        const item = categories[cat][j];

                        const category_item: HTMLElement = document.createElement("div");
                        // category_item.setAttribute("href", "http://google.fr");
                        // category_item.setAttribute("target", "_parent");
                        item["category_item"] = category_item;

                        category_item.onclick = function (ev) {
                            if (item.url) {
                                window.parent.location.href = item.url;
                            }
                            // _this.selectionManager.select(item.identity, true)
                            //     .then(function (ids: any[]) {
                            //         selectItems(ids);
                            //     });
                        }

                        category_item.className = "category_item " + (j % 2 === 0 ? "category_item_even" : "category_item_odd");

                        const left_chart: HTMLElement = document.createElement("div");
                        left_chart.className = "left_chart";
                        Visual.pie(left_chart, item.value_text, item.value_arc, item.vor_flag);
                        const content_text: HTMLElement = document.createElement("div");
                        content_text.className = "content_text";
                        category_item.appendChild(left_chart);
                        category_item.appendChild(content_text);
                        category_content.appendChild(category_item);

                        const libelle_text: HTMLElement = document.createElement("div");
                        libelle_text.className = "libelle_text";
                        libelle_text.innerText = item.subcategory;

                        const point_text: HTMLElement = document.createElement("div");
                        point_text.className = "point_text";
                        const pt_total = item.point_total ? ` / ${item.point_total}` : "";
                        const pt_value = point_value ? item.point_value : "";
                        point_text.innerText = `${pt_value}${pt_total} points`;
                        content_text.appendChild(libelle_text);
                        content_text.appendChild(point_text);
                    }
                }
            }
            catch (ex) {
                console.error('Update Error', ex);
            }
        }

        public static pie(parent: HTMLElement, value: number, arc_value: number, vor: number) {
            const radius = 45, arc_width = 8;
            const svg = d3.select(parent).append("svg");
            const gcontainer = svg.append('g');

            const color1 = ["#003A84", "#00B0E8"];
            const color2 = ["#30629D", "#3DC0ED"];
            const colorNAN = ["#003A84", "#003A84"];

            gcontainer.attr("transform", `translate(${radius}, ${radius})`);
            const pie = d3.pie().sort(null).value(d => <any>d);
            var arc1 = d3.arc().outerRadius(radius).innerRadius(radius - arc_width);
            var arc2 = d3.arc().outerRadius(radius - arc_width + 1).innerRadius(radius - arc_width * 2);

            if (arc_value == null) {
                gcontainer.append("g")
                    .selectAll("path")
                    .data(pie([0, 100]))
                    .enter()
                    .append("path")
                    .style("fill", d => colorNAN[d.index])
                    .attr("d", <any>arc1);

                gcontainer.append("g")
                    .selectAll("path")
                    .data(pie([0, 100]))
                    .enter()
                    .append("path")
                    .style("fill", d => colorNAN[d.index])
                    .attr("d", <any>arc2);
            } else {
                gcontainer.append("g")
                    .selectAll("path")
                    .data(pie([arc_value, 100 - arc_value]))
                    .enter()
                    .append("path")
                    .style("fill", d => color1[d.index])
                    .attr("d", <any>arc1);

                gcontainer.append("g")
                    .selectAll("path")
                    .data(pie([arc_value, 100 - arc_value]))
                    .enter()
                    .append("path")
                    .style("fill", d => color2[d.index])
                    .attr("d", <any>arc2);
            }

            let vor_color = "#000";

            switch (vor) {
                case 1: vor_color = "red"; break;
                case 10: vor_color = "orange"; break;
                case 100: vor_color = "green"; break;
            }

            gcontainer.append('g')
                .selectAll('text')
                .data([value])
                .enter()
                .append('text')
                .attr('text-anchor', 'middle')
                .style('fill', vor_color)
                .style("font-weight", "500")
                .style('font-size', `${20}px`)
                .attr("dy", 8)
                .text(d => d);
        }

        public static getvalues(categorical: DataViewCategorical, name: string): any {
            const item = categorical.values.filter(f => f.source.roles[name]);

            if (item && item.length > 0) {
                return item[0].values;
            }
        }

        private static parseSettings(dataView: DataView): VisualSettings {
            return VisualSettings.parse(dataView) as VisualSettings;
        }

        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
            const oi = VisualSettings.enumerateObjectInstances(this.settings || VisualSettings.getDefault(), options);

            console.log(oi);

            return oi;
        }
    }
}