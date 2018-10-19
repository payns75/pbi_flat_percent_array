module powerbi.extensibility.visual {
    "use strict";
    export class Visual implements IVisual {
        private settings: VisualSettings;
        private container: HTMLElement;

        constructor(options: VisualConstructorOptions) {
            const target = options.element;
            this.container = document.createElement("div");
            this.container.className = "container";
            target.appendChild(this.container);
        }

        public update(options: VisualUpdateOptions) {
            this.settings = Visual.parseSettings(options && options.dataViews && options.dataViews[0]);

            let categorical = options.dataViews[0].categorical;
            let category = categorical.categories[0];
            let subcategory = categorical.categories[1];
            let value_text = Visual.getvalues(categorical, "value_text");
            let value_arc = Visual.getvalues(categorical, "value_arc");
            let vor_flag = Visual.getvalues(categorical, "vor_flag");
            let point_value = Visual.getvalues(categorical, "point_value");
            let point_total = Visual.getvalues(categorical, "point_total");
            const data = [];

            for (let i = 0, len = category.values.length; i < len; i++) {
                data.push({
                    category: category.values[i],
                    subcategory: subcategory.values[i],
                    value_text: value_text[i],
                    value_arc: value_arc[i],
                    vor_flag: vor_flag[i],
                    point_value: point_value[i],
                    point_total: point_total[i]
                });
            }

            const groupBy = function (array, prop) {
                return array.reduce(function (groups, item) {
                    const val = item[prop]
                    groups[val] = groups[val] || []
                    groups[val].push(item)
                    return groups
                }, {})
            };

            var categories = groupBy(data, "category");
            this.container.innerHTML = "";

            for (let i = 0, len = Object.keys(categories).length; i < len; i++) {
                const cat = Object.keys(categories)[i];
                const category_container: HTMLElement = document.createElement("div");
                category_container.className = "category_container";
                const category_title: HTMLElement = document.createElement("div");
                category_title.className = "category_title";
                category_title.textContent = cat;
                category_container.appendChild(category_title);
                const category_content: HTMLElement = document.createElement("div");
                category_content.className = "category_content";
                category_container.appendChild(category_content);
                this.container.appendChild(category_container);

                for (let j = 0, len2 = categories[cat].length; j < len2; j++) {
                    const item = categories[cat][j];

                    const category_item: HTMLElement = document.createElement("div");
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
                    point_text.innerText = `${item.point_value} / ${item.point_total} points`;
                    content_text.appendChild(libelle_text);
                    content_text.appendChild(point_text);
                }
            }
        }

        public static pie(parent: HTMLElement, value: number, arc_value: number, vor: number) {
            const svg = d3.select(parent).append("svg");
            const gcontainer = svg.append('g').classed('percenter', true);
            const radius = 45, arc_width = 8;
            const color1 = ["#003A84", "#00B0E8"];
            const color2 = ["#30629D", "#3DC0ED"];
            gcontainer.attr("transform", `translate(${radius}, ${radius})`);
            const pie = d3.pie().sort(null).value(d => <any>d);
            var arc1 = d3.arc().outerRadius(radius).innerRadius(radius - arc_width);
            var arc2 = d3.arc().outerRadius(radius - arc_width + 1).innerRadius(radius - arc_width * 2);

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
                .text(d => d + "%");
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
            return VisualSettings.enumerateObjectInstances(this.settings || VisualSettings.getDefault(), options);
        }
    }
}