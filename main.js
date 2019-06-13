function setup(){
}

function process(){
    var graphData = JSON.parse(rawData);
    var input1 = document.getElementById("input1").value;
    var input2 = document.getElementById("input2").value;
    var InputType1 = document.getElementById("InputType1").checked;
    var InputType2 = document.getElementById("InputType2").checked;
    var OutputType1 = document.getElementById("OutputType1").checked;
    if (!InputType1)
        input1=input1*0.3048;
    if (!InputType2)
        input2=input2*0.45359237;
    var input = input1/Math.pow(input2,(1/3));

    var target=findPoint(graphData,input);

    //console.log(input,target[0],target[1]);
    var outputData=[graphData[target[0]].Pr2,graphData[target[0]].Pso2,graphData[target[0]].Ir2,graphData[target[0]].Is2,graphData[target[0]].ta2,graphData[target[0]].to2,graphData[target[0]].U2,graphData[target[0]].Lw2];
    //outputData.sort(sortFunction);
    var data = transposeJSON(graphData);
    Chart1(data,target[0]);
    var b1=bfinder(data[target[0]][5],data[target[0]][2],data[target[0]][6],data[target[0]][7]);
    var b2=bfinder(data[target[0]][4],data[target[0]][1],data[target[0]][6],data[target[0]][7]);
    present(outputData);
    var points = PointCreator(data[target[0]][4],1013,data[target[0]][2],data[target[0]][6],data[target[0]][7],b1,b2);
    Chart2(points);
}

function present(outputData){
    document.getElementById("result1.1").innerHTML = "Pr: " + outputData[0]+ " psi";
    document.getElementById("result1.2").innerHTML = "Pso: " + outputData[1] + " psi";
    document.getElementById("result2.1").innerHTML = "Ir: " + outputData[2] + " psi-ms/lb^(1/3)";
    document.getElementById("result2.2").innerHTML = "Is: " + outputData[3] + " psi-ms/lb^(1/3)";
    document.getElementById("result3.1").innerHTML = "ta: " + outputData[4] + " ms/lb^(1/3)";
    document.getElementById("result3.2").innerHTML = "to: " + outputData[5] + " ms/lb^(1/3)";
    document.getElementById("result4.1").innerHTML = "U: " + outputData[6] + " ft/ms";
    document.getElementById("result4.2").innerHTML = "Lw: " + outputData[7] + " ft/lb^(1/3)";
}

function findPoint(graphData,input){
    var target=[-1,-1];
    for(i=0;i<graphData.length;i++)
    {
        //console.log(input,parseFloat(graphData[i].Z.replace(',','.')),graphData[i].Z)
        if(input>parseFloat(graphData[i].Z.replace(',','.'))){
            target[0] = i;
            target[1] = i+1;
        }
        if(input==parseFloat(graphData[i].Z.replace(',','.'))){
            target[0] = i;
            target[1] = i;
        }
    }
    if(target[1]>=graphData.length)target[1]=i;
    return target;
}

function sortFunction(a, b) {
    if (a[0] === b[0]) {
        return 0;
    }
    else {
        return (a[0] < b[0]) ? -1 : 1;
    }
}

function transposeJSON(graphData){
    var data=[];
    for(i=0;i<graphData.length;i++){
        data[i]=[parseFloat(graphData[i].Z.replace(',','.')),parseFloat(graphData[i].Ir2.replace(',','.')),parseFloat(graphData[i].Is2.replace(',','.')),parseFloat(graphData[i].Lw2.replace(',','.')),parseFloat(graphData[i].Pr2.replace(',','.')),parseFloat(graphData[i].Pso2.replace(',','.')),parseFloat(graphData[i].ta2.replace(',','.')),parseFloat(graphData[i].to2.replace(',','.')),parseFloat(graphData[i].U2.replace(',','.'))];
    }
    return data;
}

function Chart1(graphData,row){
    google.charts.load('current', {packages: ['corechart', 'line']});
    google.charts.setOnLoadCallback(drawCrosshairs);
    function drawCrosshairs() {
        var data = new google.visualization.DataTable();
        data.addColumn('number', 'Z');
        data.addColumn('number', 'Ir, psi-ms/lb^(1/3)');
        data.addColumn('number', 'Is, psi-ms/lb^(1/3)');
        data.addColumn('number', 'Lw, ft/lb^(1/3)');
        data.addColumn('number', 'Pr, psi');
        data.addColumn('number', 'Pso, psi');
        data.addColumn('number', 'ta, ms/lb^(1/3)');
        data.addColumn('number', 'to, ms/lb^(1/3)');
        data.addColumn('number', 'U, ft/ms');


        data.addRows(graphData);

        var options = {
            hAxis: {
                title: 'Z',
                logScale: 'true'
            },
            vAxis: {
                logScale: 'true'
            },
            crosshair: {
                color: '#000',
                trigger: 'selection'
            },
            width: '100%',
            height: 800,
            interpolateNulls: true,
            selectionMode: 'multiple'
        };

        var chart = new google.visualization.LineChart(document.getElementById('chart_div'));

        chart.draw(data, options);
        chart.setSelection([{row: row}]);

    }
}

function bfinder(P,input,ta,to){
    var b1=0.0001;
    var b2=20;
    var proximity=0.00001;
    var plot;
    plot=integral(b2,P,ta,to,proximity);
    while(Math.abs(input-plot)>1){
        plot=integral((b2+b1)/2,P,ta,to,proximity);
        if(input<plot){
            b1=(b2+b1)/2;
        }else{
            b2=(b2+b1)/2;
        }
       console.log(input,plot,b1,b2);
    }
    return (b2+b1)/2;
}

function integral(b,Pso,ta,to,proximity){
    var result=0;
    var t;
    for(t=ta;t<ta+to-proximity;t=t+proximity) {
        result = result + (((equation(t, b, Pso, ta, to)+ equation(t + proximity, b, Pso, ta, to)) * proximity) / 2);
    }
    return result;
}

function equation(t,b,P,ta,to){
    return (P*(1-((t-ta)/to))*Math.pow(Math.E,(-b*((t-ta)/to))));
}



function PointCreator(Pr,Pso,Is,ta,to,b1,b2){
    var points=[];
    points[0]=[0,Pso,Pso,Pso];
    points[1]=[ta,Pso,Pso,Pso];
    points[2]=[ta,Pso,0+Pso,0+Pso];

    var i =3;
    var step = to/99;
    for (t=ta;t<ta+to;t=t+step){
        points[i]=[t,Pso,equation(t,b1,Pso,ta,to)+Pso,equation(t,b2,Pr,ta,to)+Pso];
        i++;
    }
    return points;
}

function Chart2(points){
    google.charts.load('current', {packages: ['corechart', 'line']});
    google.charts.setOnLoadCallback(drawCrosshairs);
    function drawCrosshairs() {
        var data = new google.visualization.DataTable();
        data.addColumn('number', 't');
        data.addColumn('number', 'Pso');
        data.addColumn('number', 'Ps');
        data.addColumn('number', 'Pr');


        data.addRows(points);

        var options = {
            hAxis: {
                title: 't',
            },
            vAxis: {
            },
            crosshair: {
                color: '#000',
                trigger: 'selection'
            },
            width: '100%',
            height: 800,
            interpolateNulls: true,
            selectionMode: 'multiple'
        };

        var chart = new google.visualization.LineChart(document.getElementById('chart_div2'));

        chart.draw(data, options);

    }
}