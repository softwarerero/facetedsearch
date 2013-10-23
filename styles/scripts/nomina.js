var Nomina,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

$(function() {
  return window.Nomina.init();
});

Nomina = (function() {
  function Nomina() {
    this.resultUpdate = __bind(this.resultUpdate, this);
    this.initMainPage = __bind(this.initMainPage, this);
    this.loadZip = __bind(this.loadZip, this);
  }

  Nomina.prototype.name = "funcionarios";

  Nomina.prototype.item_template = "<tr class=\"item\">\n  <td><%= obj.nombre %></td>\n  <td><% if (obj.cargo) {  %><%= obj.cargo %><% } %></td>\n  <td><%= obj.categoria %></td>\n  <td><%= obj.sueldo %></td>\n  <td><%= obj.gastos %></td>\n  <td><%= obj.bonificacion %></td>\n  <td><%= obj.antiguedad %></td>\n  <td><%= obj.estado %></td>\n  <td><%= obj.institucion %></td>\n</tr>";

  Nomina.prototype.init = function() {
    var json, location;
    location = window.location.href.toString().split(window.location.host)[1];
    if (location.indexOf("nomina") > -1) {
      return json = this.loadZip();
    }
  };

  Nomina.prototype.loadZip = function() {
    var _this = this;
    return $.getJSON("/nomina.json.js", function(json) {
      return _this.initMainPage(json);
    });
  };

  Nomina.prototype.initMainPage = function(json) {
    var settings;
    settings = {
      items: json,
      facets: {
        'cargo': 'Cargo',
        'cargo': 'Cargo',
        'categoria': 'Categoria',
        'antiguedad': 'Antiguedad',
        'institucion': 'Institucion'
      },
      resultSelector: '#results',
      facetSelector: '#facets',
      resultTemplate: this.item_template,
      orderByOptions: {
        'nombre': 'Nombre',
        'cargo': 'Cargo',
        'categoria': 'Categoria',
        'sueldo': 'Sueldo',
        'antiguedad': 'Antiguedad'
      },
      facetContainer: '<div class="facetsearch" id=<%= id %> ></div>',
      facetListContainer: '<select class=facetlist multiple"></select>',
      listItemTemplate: '<option class=facetitem id="<%= id %>" value="<%= name %>"><%= name %> <span class=facetitemcount>(<%= count %>)</span></option>',
      bottomContainer: '<div class="bottomline"></div>',
      deselectTemplate: '<span class=deselectstartover><button class="btn btn-large btn-primary" type="button">Reiniciar Filtros</button></span>',
      facetTitleTemplate: '<h5 class=facettitle><%= title %></h5>',
      showMoreTemplate: '<a id=showmorebutton>Más</a>',
      paginationCount: 15,
      callbackResultUpdate: this.resultUpdate,
      textFilter: '#filter1'
    };
    $.facetelize(settings);
    $("#filter1").prependTo($(".bottomline"));
    $("#filter1Lable").prependTo($(".bottomline"));
    $("#filter1").keypress(function(event) {
      if (event.which === 13) {
        event.preventDefault();
        return $.facetUpdate();
      }
    });
    return $(window).resize(function() {
      return $("#salarioAnhos").css("width", $(".container2").width());
    });
  };

  Nomina.prototype.resultUpdate = function(items) {
    var max, min, sueldoTotal, sueldos;
    sueldoTotal = 0;
    items.forEach(function(item) {
      return sueldoTotal += parseInt(item.sum);
    });
    $("#sueldoTotal").html(this.formatCurrency(sueldoTotal));
    $("#sueldoPromedio").html(this.formatCurrency(sueldoTotal / items.length));
    sueldos = _.map(items, function(item) {
      return item.sum;
    });
    sueldos = _.filter(sueldos, function(num) {
      return num > 0;
    });
    min = Math.min.apply(this, sueldos);
    $("#minimo").html(this.formatCurrency(min));
    max = Math.max.apply(this, sueldos);
    $("#maximo").html(this.formatCurrency(max));
    this.ageGraph(items);
    return $("#salarioAnhos").css("width", $(".container2").width());
  };

  Nomina.prototype.ageGraph = function(items) {
    var anho, anhos, ctx, currentYear, data, salario, salarioAnhos, salarioAnhos2, salarioAnhosChart, salarios;
    currentYear = (new Date()).getFullYear();
    salarioAnhos = {};
    items.forEach(function(item) {
      var antiguedad, salario;
      antiguedad = parseInt(item.antiguedad);
      salario = parseInt(item.sum);
      if (antiguedad) {
        if (!salarioAnhos[antiguedad]) {
          salarioAnhos[antiguedad] = 0;
        }
        return salarioAnhos[antiguedad] = salarioAnhos[antiguedad] + salario;
      }
    });
    salarioAnhos2 = [];
    for (anho in salarioAnhos) {
      salario = salarioAnhos[anho];
      salarioAnhos2.push([anho, salario]);
    }
    salarioAnhos2 = _(salarioAnhos2).sortBy(function(a) {
      return parseInt(a[0]);
    });
    anhos = _.map(salarioAnhos2, function(sa) {
      return sa[0];
    });
    salarios = _.map(salarioAnhos2, function(sa) {
      return sa[1];
    });
    data = {
      labels: anhos,
      datasets: [
        {
          fillColor: "rgba(220,220,220,0.5)",
          strokeColor: "rgba(220,220,220,1)",
          pointColor: "rgba(220,220,220,1)",
          pointStrokeColor: "#fff",
          data: salarios
        }, {
          fillColor: "rgba(151,187,205,0.5)",
          strokeColor: "rgba(151,187,205,1)",
          pointColor: "rgba(151,187,205,1)",
          pointStrokeColor: "#fff",
          data: anhos
        }
      ]
    };
    ctx = $("#salarioAnhos").get(0).getContext("2d");
    return salarioAnhosChart = new Chart(ctx).Line(data);
  };

  Nomina.prototype.formatCurrency = function(num) {
    var i, sign;
    num = num.toString().replace(/\$|\,/g, '');
    if (!num) {
      num = "0";
    }
    num = Math.floor(num * 100 + 0.50000000001);
    num = Math.floor(num / 100).toString();
    i = 0;
    while (i < Math.floor((num.length - (1 + i)) / 3)) {
      num = num.substring(0, num.length - (4 * i + 3)) + '.' + num.substring(num.length - (4 * i + 3));
      i++;
    }
    sign = num < 0 ? "-" : "";
    return sign + num;
  };

  return Nomina;

})();

window.Nomina = new Nomina;
