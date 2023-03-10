import {Chart} from "chart.js";

export const getOrCreateTooltip = (chart: Chart) => {
    let tooltipEl = chart.canvas.parentNode!.querySelector('div');

    if (!tooltipEl) {
        tooltipEl = document.createElement('div');
        tooltipEl.style.background = 'rgba(0, 0, 0, 0.7)';
        tooltipEl.style.borderRadius = '8px';
        tooltipEl.style.zIndex = '2';
        tooltipEl.style.color = 'white';
        tooltipEl.style.opacity = '1';
        tooltipEl.style.width = '200px';
        tooltipEl.style.pointerEvents = 'none';
        tooltipEl.style.position = 'absolute';
        tooltipEl.style.transform = 'translate(-50%, 0)';
        tooltipEl.style.transition = 'all .1s ease';
        tooltipEl.style.display = 'flex';
        tooltipEl.style.flexDirection = 'row';
        tooltipEl.style.alignItems = 'center';
        chart.canvas.parentNode!.appendChild(tooltipEl);
    }

    return tooltipEl;
};
export const externalTooltipHandler = (context: any) => {
    // Tooltip Element
    const {chart, tooltip} = context;
    const tooltipEl = getOrCreateTooltip(chart);

    // Hide if no tooltip
    if (tooltip.opacity === 0) {
        tooltipEl.style.opacity = '0';
        return;
    }

    // Set Text
    if (tooltip.body) {
        const bodyLines = tooltip.body.map((b: any) => b.lines);

        bodyLines.forEach((body: any, i: number) => {
            const colors = tooltip.labelColors[i];

            const span = document.createElement('span');
            span.style.background = colors.backgroundColor;
            span.style.borderColor = colors.borderColor;
            span.style.borderWidth = '0';
            span.style.marginRight = '8px';
            span.style.height = '8px';
            span.style.width = '8px';
            span.style.display = 'inline-block';

            const text = document.createTextNode(body);

            while (tooltipEl!.firstChild) {
                tooltipEl!.firstChild.remove();
            }

            tooltipEl.appendChild(span);
            tooltipEl.appendChild(text);
        });
    }

    // Display, position, and set styles for font
    tooltipEl.style.opacity = '1';
    tooltipEl.style.left = '0%';
    tooltipEl.style.top = '50%';
    tooltipEl.style.transform = 'translateY(-50%)';
    tooltipEl.style.padding = tooltip.options.padding + 'px ' + tooltip.options.padding + 'px';
};
