var isDeviceReady = false;
var isDocumentReady = false;
var preventRunDefault = false;

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.addEventListener("backbutton", this.onBackKeyDown, false);
    },
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    onBackKeyDown: function(e){
        e.preventDefault();
        
        if (AppData.processing) {
            return false;
        }
        
        /*if (AppData.page==PAGE_CITY) {
            app.exitFromApp();
            return true;
        }*/
        
        if (AppData.page==PAGE_ZONE || AppData.page==PAGE_CONSTRUCT || AppData.page==PAGE_PROJECT) {
            Vivendo.backCity();
            return true;
        }
       
        if (AppData.page==PAGE_SEARCH || AppData.page==PAGE_DETAIL) {
            Vivendo.initProject();
            return true;
        }
        
        return false;
    },
    receivedEvent: function(id) {
        isDeviceReady = true;
        Vivendo.init();
    },
    exitFromApp: function(){
        phonedialer.exit(this.onPhoneFail, this.onPhoneSuccess);
    }
};

var PAGE_SPLASH = 0;
var PAGE_CITY = 1;
var PAGE_ZONE = 2;
var PAGE_CONSTRUCT = 3;
var PAGE_PROJECT = 4;
var PAGE_SEARCH = 5;
var PAGE_DETAIL = 6;

var cityApp = [['1', 'Bogotá'], ['2', 'Cali'],['769','Medellín'],['1775','Monteria'],
['1396','Santa Marta'],['1776','Turbaco'],['1447','Santa Rosa'],['1408','Soacha'],
['1402','Soledad'],['1437','Sabaneta'],['1460','Rozo'],['1459','Palmira'],['1398','Pereira'],
['1449','Piedecuesta'],['1416','Ricaurte'],['1425','Tunja'],['1401','Valledupar'],['1426','Villavicencio'],
['1571','Yumbo'],['1424','Zipaquira'],['1397','Manizales'],['1453','Calima-Darién'],['1454','Candelaria'],['1399','Cartagena'],
['1403','Chia'],['1420','Cajicá'],['766','Barranquilla'],['1570','Bello'],['1137','Bucaramanga'],['1400','Cúcuta'],['1448','Dos Quebradas'],
['1427','Ibagué'],['1458','Jamundí'],['1422','La Calera'],['1407','Madrid'],['1418','Guasca'],['1414','Girardot'],['1456','Facatativá'],
['1412','Funza'],['1406','Fusagasugá'],['1141','Armenia']];

var AppData={
    processing: true,
    page: PAGE_SPLASH,
    city_id: '0',
    city_name: '',
    
    zone_id: '0',
    zone_name: '',
    
    construct_id: '0',
    construct_name: '',
    
    project_id: '0',
    project_name: '',
    project_phone: '',
    
    type_id: '0',
    
    browse: '',     // zone, construct, search
    browse_title: '',
    browse_logo: '',
    
    images: [],
    image_count: 0,
    
    location_count:0,
    locations: [],
    
    initBrowse: function(){
        this.browse='';
        this.browse_title='';
        this.browse_logo='';
        
        this.project_id = '0';
        this.project_name='';
        this.project_phone='';
        
        this.type_id='0';
        
        this.image_count=0;
        this.images = Array();
        
        this.location_count=0;
        this.locations = Array();
    },
    
    initZone: function(){
        this.zone_id='0';
        this.zone_name='';
        
        this.initBrowse();
    },
    initConstruct: function(){
        this.construct_id='0';
        this.construct_name='';
        
        this.initBrowse();
    },
    
    initCity: function(){
        this.processing=false;
        this.initZone();
        this.initConstruct();
        this.initBrowse();
    },
    
    init : function(){
        this.processing=false;
        this.city_id='0';
        this.city_name='';

        this.initZone();
        this.initConstruct();
        this.initBrowse();
    }
};

var Vivendo = {
    type: [],
    price: [],
    
    init: function(){
        if (isDeviceReady && isDocumentReady) {
            this.getType();
        }
    },
    loading: function(load){
        if (load){
            $(".ui-loader").show();
        } else{
            $(".ui-loader").hide();
        }
    }, 
    
    changePage: function(dest, transition){
        $.mobile.changePage( dest, { transition: transition });
    },

    getType: function(){
        $.ajax({
            type: 'POST',
            data: { },
            url: 'http://www.vivendo.co/services/types',
            success: function (data) {
                if (data.nodes) {
                    $("#list_type").html('');
                    $.each(data.nodes, function(index, row){
                        Vivendo.type[index]= { id: row.node.id, name:  row.node.título };
                        $("#list_type").append('<li data-id="'+index+'">'+row.node.título+'</li>');
                    });
                } 
                setTimeout(Vivendo.getPrice(), 1000);
            },
            error: function (data) {
                setTimeout(Vivendo.getPrice(), 1000);
            }
        });
    },
    getPrice: function(){
        Vivendo.price[0] = {id: 0, name: 'Todos'};
        $.ajax({
            type: 'POST',
            data: { },
            url: 'http://www.vivendo.co/services/prices',
            success: function (data) {
                if (data.nodes) {
                    $.each(data.nodes, function(index, row){
                      var price = row.node.name.split('|');
                      Vivendo.price[index+1]= { id: row.node.id, name:  'De ' + ($.number(price[0]/1000000) ) + ' a ' + ($.number(price[1]/1000000) ) + ' Millones' };
                    });
                } 
                
                setTimeout(Vivendo.getCitys(), 1000);
            },
            error: function (data) {
                setTimeout(Vivendo.getCitys(), 1000);
            }
        });
    },
    getCitys : function(){
        $.ajax({
            type: 'POST',
            data: { },
            url: 'http://www.vivendo.co/services/cities',
            success: function (data) {
                var html="";
                if (data.nodes) {
                    $.each(data.nodes, function(index, row){
                        var n=row.node.name;
                        var p="";
                        var i = n.indexOf(" - ");
                        if (i>=0){
                            p = n.substring(i);
                            n = n.substring(0,i);
                        }
                        
                        var logo="img/icon.png";
                        if (row.node.imagen!=null && row.node.imagen!=''){
                            logo= row.node.imagen;
                        }
                        
                        html += ''+
                        '<li data-id="'+row.node.id+'" data-have="1">' +
                            '<div class="row ui-li-content">'+
                                //'<img class="img-circle photo" src="'+logo+'">'+
                                '<div class="ui-li-text">'+
                                    '<span class="title">'+n+'</span>'+
                                    '<span class="desc">'+p+'</span>'+
                                '</div>'+
                                '<img class="detail" src="assets/img/detail.png">'+
                            '</div>'+
                        '</li>'+
                        '';
                
                        if (index==data.nodes.length-1){
                            $("#list_city").prepend(html);
                        }
                    });
                } 
                
                setTimeout(Vivendo.initCity(), 5000);
            },
            error: function (data) {
                setTimeout(Vivendo.initCity(), 5000);
            }
        });
    },
    initCity: function(){
        AppData.page = PAGE_CITY;
        AppData.processing = false;
        this.changePage("#pg_city", "slide");
    },
    
    getZones : function(){
        Vivendo.loading(true);
        AppData.processing = true;
        $("#list_zone").html('');
        
        $.ajax({
            type: 'POST',
            data: { },
            url: 'http://www.vivendo.co/services/zones/'+AppData.city_id,
            success: function (data) {
                if (data.nodes) {
                    $.each(data.nodes, function(index, row){
                        var n=row.node.name;
                        var p="";
                        var i = n.indexOf(" - ");
                        if (i>=0){
                            p = n.substring(i);
                            n = n.substring(0,i);
                        }
                        
                        var html="";
                        html += ''+
                        '<li data-id="'+row.node.id+'" data-have="1">' +
                            '<div class="row ui-li-content">'+
                                '<div class="ui-li-text">'+
                                    '<span class="title">'+n+'</span>'+
                                    '<span class="desc">'+p+'</span>'+
                                '</div>'+
                                '<img class="detail" src="assets/img/detail.png">'+
                            '</div>'+
                        '</li>'+
                        '';
                
                        $("#list_zone").append(html);
                    });
                } 
                
                setTimeout(Vivendo.initZone(), 1000);
            },
            error: function (data) {
                AppData.processing = false;
                Vivendo.loading(false);
            }
        });
    },
    initZone: function(){
        Vivendo.loading(false);
        AppData.page = PAGE_ZONE;
        AppData.processing = false;
        this.changePage("#pg_zone", "slide");
    },

    getConstructs : function(){
        Vivendo.loading(true);
        AppData.processing = true;
        $("#list_construct").html('');
        
        for( var i=0; i<cityApp.length; i++ ) {
            if(cityApp[i][1] == AppData.city_name){
               var realCityId = cityApp[i][0];               
               break;
            }
        }
        
        $.ajax({
            type: 'POST',
            data: { },
            url: 'http://www.vivendo.co/services/buildersbycity/'+realCityId,
            success: function (data) {
                if (data.nodes) {
                    $.each(data.nodes, function(index, row){
                        var n=row.node.name;
                        var p="";
                        var i = n.indexOf(" - ");
                        if (i>=0){
                            p = n.substring(i);
                            n = n.substring(0,i);
                        }
                        
                        var logo="img/icon.png";
                        if (row.node.logo!=null && row.node.logo!=''){
                            logo=row.node.logo;
                        }
                        
                        var html="";
                        
                        if ( row.node.count_project > 0 ) {
                        
                          html += ''+
                          '<li data-id="'+row.node.id+'" data-have="'+row.node.count_project+'">' +
                              '<div class="row ui-li-content">'+
                                  '<img class="photo" src="'+logo+'">'+
                                  '<div class="ui-li-text">'+
                                      '<span class="title">'+n+'</span>'+
                                      '<span class="desc">'+p+'</span>'+
                                  '</div>'+
                                  '<img class="detail" src="assets/img/detail.png">'+
                              '</div>'+
                          '</li>'+
                          '';
                        
                        }
                
                        $("#list_construct").append(html);
                    });
                } 
                
                setTimeout(Vivendo.initConstruct(), 1000);
            },
            error: function (data) {
                AppData.processing = false;
                Vivendo.loading(false);
            }
        });
    },
    initConstruct: function(){
        Vivendo.loading(false);
        AppData.page = PAGE_CONSTRUCT;
        AppData.processing = false;
        this.changePage("#pg_construct", "slide");
    },
    
    getProjectByZone: function(){
        Vivendo.loading(true);
        AppData.processing = true;
        
        //init component.
        $("#list_project").html('');
        AppData.location_count = 0;
        AppData.locations = Array();
        
        $.ajax({
            type: 'POST',
            data: { },
            url: 'http://www.vivendo.co/services/projectsbyzone/'+AppData.zone_id,
            success: function (data) {
                if (data.nodes) {
                    $.each(data.nodes, function(index, row){
                        var id=row.node.id;
                        var n=row.node.title;
                        var t=row.node.Tipo;
                        var addr = row.node.address;
                        var price = row.node.price;
                        var logo = "img/icon.png";
                        var bg="img/background.png";
                        var b_logo = AppData.browse_logo;
                        
                        if (row.node.logo!=null && row.node.logo!=''){
                            logo = row.node.logo;
                        }
                        if (row.node.builder_logo!=null && row.node.builder_logo!=''){
                            b_logo = row.node.builder_logo;
                        }
                        if (t==null || t==''){
                            t="&nbsp;";
                        }
                        if (n==null || n==''){
                            n="&nbsp;";
                        }
                        if (addr==null || addr==''){
                            addr="&nbsp;";
                        }
                        if (price==null || price==''){
                            price="$0";
                        }

                        if (row.node.images!=null && row.node.images!=''){
                            var ii = row.node.images.split(",");
                            bg=ii[0];
                        }
                        
                        if (row.node.coordinates!=null && row.node.coordinates!=''){
                            var ll = row.node.coordinates.split(',');
                            if (ll.length==2){
                                AppData.locations[AppData.location_count]={ 
                                    latLng: [ parseFloat(ll[0].replace(' ', '')), parseFloat(ll[1].replace(' ', '')) ],
                                    data: {
                                        id: id,
                                        type: t,
                                        title: n,
                                        address: addr,
                                        price: price,
                                        logo: logo,
                                        b_logo: b_logo,
                                    }
                                };
                                AppData.location_count++;
                            }
                        }
                        
                        var html="";
                        html += ''+
                                '<li data-id="'+id+'" data-have="1">'+
                                    '<div class="row ui-li-content">'+
                                        '<img class="photo" src="'+b_logo+'">'+
                                        '<div class="ui-li-text">'+
                                            '<h6>'+t+'</h6>'+
                                            '<h4>'+n+'</h4>'+
                                            '<h5>'+addr+'</h5>'+
                                        '</div>'+
                                        '<img class="detail" src="assets/img/detail.png">'+
                                    '</div>'+
                                    '<div class="row ui-li-content ui-li-additional" style="background: url(\''+bg+'\') no-repeat center center; background-color: #d8d8d8; background-size: cover; -webkit-background-size: cover; -moz-background-size: cover; -o-background-size: cover;">'+
                                        '<div class="ui-li-price">'+
                                            '<div class="ui-text-price">'+
                                                '<span class="title">Desde</span>'+
                                                '<span class="desc">'+price+'</span>'+
                                            '</div>'+
                                            '<div class="ui-price-logo">'+
                                                '<img class="logo" src="'+logo+'">'+
                                            '</div>'+
                                        '</div>'+
                                    '</div>'+
                                '</li>'+
                                '';
                        $("#list_project").append(html);
                        
                    });
                } 
                
                setTimeout(Vivendo.initProject(), 1000);
            },
            error: function (data) {
                AppData.processing = false;
                Vivendo.loading(false);
            }
        });
    },
    getProjectByConstruct: function(){
        Vivendo.loading(true);
        AppData.processing = true;
        
        //init component.
        $("#list_project").html('');
        AppData.location_count = 0;
        AppData.locations = Array();
        
        $.ajax({
            type: 'POST',
            data: { },
            url: 'http://www.vivendo.co/services/projectsbybuilder/'+AppData.construct_id,
            success: function (data) {
                if (data.nodes) {
                    $.each(data.nodes, function(index, row){
                        var id=row.node.id;
                        var n=row.node.title;
                        var t=row.node.Tipo;
                        var addr = row.node.address;
                        var price = row.node.price;
                        var logo = "img/icon.png";
                        var bg="img/background.png";
                        var b_logo = AppData.browse_logo;
                        
                        if (row.node.logo!=null && row.node.logo!=''){
                            logo = row.node.logo;
                        }
                        if (row.node.builder_logo!=null && row.node.builder_logo!=''){
                            b_logo = row.node.builder_logo;
                        }
                        
                        if (t==null || t==''){
                            t="&nbsp;";
                        }
                        if (n==null || n==''){
                            n="&nbsp;";
                        }
                        if (addr==null || addr==''){
                            addr="&nbsp;";
                        }
                        if (price==null || price==''){
                            price="$0";
                        }

                        if (row.node.images!=null && row.node.images!=''){
                            var ii = row.node.images.split(",");
                            bg=ii[0];
                        }
                        
                        if (row.node.coordinates!=null && row.node.coordinates!=''){
                            var ll = row.node.coordinates.split(',');
                            if (ll.length==2){
                                AppData.locations[AppData.location_count]={ 
                                    latLng: [   parseFloat(ll[0]), parseFloat(ll[1]) ],
                                    data: {
                                        id: id,
                                        type: t,
                                        title: n,
                                        address: addr,
                                        price: price,
                                        logo: logo,
                                        b_logo: b_logo,
                                    }
                                };
                                AppData.location_count++;
                            }
                        }
                        
                        var html="";
                        html += ''+
                                '<li data-id="'+id+'" data-have="1">'+
                                    '<div class="row ui-li-content">'+
                                        '<img class="photo" src="'+b_logo+'">'+
                                        '<div class="ui-li-text">'+
                                            '<h6>'+t+'</h6>'+
                                            '<h4>'+n+'</h4>'+
                                            '<h5>'+addr+'</h5>'+
                                        '</div>'+
                                        '<img class="detail" src="assets/img/detail.png">'+
                                    '</div>'+
                                    '<div class="row ui-li-content ui-li-additional" style="background: url(\''+bg+'\') no-repeat center center; background-color: #d8d8d8; background-size: cover; -webkit-background-size: cover; -moz-background-size: cover; -o-background-size: cover;">'+
                                        '<div class="ui-li-price">'+
                                            '<div class="ui-text-price">'+
                                                '<span class="title">Desde</span>'+
                                                '<span class="desc">'+price+'</span>'+
                                            '</div>'+
                                            '<div class="ui-price-logo">'+
                                                '<img class="logo" src="'+logo+'">'+
                                            '</div>'+
                                        '</div>'+
                                    '</div>'+
                                '</li>'+
                                '';
                        $("#list_project").append(html);
                    });
                } 
                
                setTimeout(Vivendo.initProject(), 1000);
            },
            error: function (data) {
                AppData.processing = false;
                Vivendo.loading(false);
            }
        });
    },
    initProject: function(){
        Vivendo.loading(false);
        AppData.page = PAGE_PROJECT;
        AppData.processing = false;
        
        $("#pg_project .header .menu-group a.center").html(AppData.browse_title);
        $("#pg_project .ui-nav>ul>li>a").removeClass('ui-btn-active');
        $("#pg_project .ui-nav>ul>li>a").eq(0).addClass('ui-btn-active');
        $("#pg_project .ui-tab").tabs('option', 'active', 0);
        $("#pg_project .ui-tab").tabs("refresh");
        
        this.onResize();
        this.changePage("#pg_project", "slide");
    },

    search: function(e){
        Vivendo.loading(true);
        AppData.processing = true;
        
        var price_id = 'all';
        if (Vivendo.price.length>0) {
            var t = $("#slider_price").val();
            price_id = Vivendo.price[parseInt(t)].id;
        }
        
        AppData.construct_id = (AppData.construct_id == 0) ? 'all' : AppData.construct_id;
        AppData.type_id      = (AppData.type_id == 0) ? 'all' : AppData.type_id;
        AppData.zone_id      = (AppData.zone_id == 0) ? 'all' : AppData.zone_id;
        AppData.zone_id      = (AppData.zone_id == 0) ? 'all' : AppData.zone_id;
        
        var searchText = $('#txt_search').val();
        
        if ( searchText != '' ){
          searchText = searchText.replace(' ', '_');
        }
        
        $("#list_project").html('');
        AppData.location_count = 0;
        AppData.locations = Array();
        $.ajax({
            type: 'POST',
            data: { },
            url: 'http://www.vivendo.co/services/projectssearch/'+AppData.construct_id+'/'+AppData.type_id+'/'+AppData.zone_id+'/'+price_id+'/'+searchText,
            success: function (data) {
              console.log(data.nodes.length);
                if (data.nodes.length > 0) {
                  
                    $.each(data.nodes, function(index, row){
                        var id=row.node.id;
                        var n=row.node.title;
                        var t=row.node.Tipo;
                        var addr = row.node.address;
                        var price = row.node.price;
                        var logo = "img/icon.png";
                        var bg="img/background.png";
                        var b_logo = AppData.browse_logo;
                        
                        if (row.node.logo!=null && row.node.logo!=''){
                            logo = row.node.logo;
                        }
                        if (row.node.builder_logo!=null && row.node.builder_logo!=''){
                            b_logo = row.node.builder_logo;
                        }
                        
                        if (t==null || t==''){
                            t="&nbsp;";
                        }
                        if (n==null || n==''){
                            n="&nbsp;";
                        }
                        if (addr==null || addr==''){
                            addr="&nbsp;";
                        }
                        if (price==null || price==''){
                            price="$0";
                        }

                        if (row.node.images!=null && row.node.images!=''){
                            var ii = row.node.images.split(",");
                            bg=ii[0];
                        }
                        
                        if (row.node.coordinates!=null && row.node.coordinates!=''){
                            var ll = row.node.coordinates.split(',');
                            if (ll.length==2){
                                AppData.locations[AppData.location_count]={ 
                                    latLng: [   parseFloat(ll[0]), parseFloat(ll[1]) ],
                                    data: {
                                        id: id,
                                        type: t,
                                        title: n,
                                        address: addr,
                                        price: price,
                                        logo: logo,
                                        b_logo: b_logo,
                                    }
                                };
                                AppData.location_count++;
                            }
                        }
                        
                        var html="";
                        html += ''+
                                '<li data-id="'+id+'" data-have="1">'+
                                    '<div class="row ui-li-content">'+
                                        '<img class="photo" src="'+b_logo+'">'+
                                        '<div class="ui-li-text">'+
                                            '<h6>'+t+'</h6>'+
                                            '<h4>'+n+'</h4>'+
                                            '<h5>'+addr+'</h5>'+
                                        '</div>'+
                                        '<img class="detail" src="assets/img/detail.png">'+
                                    '</div>'+
                                    '<div class="row ui-li-content ui-li-additional" style="background: url(\''+bg+'\') no-repeat center center; background-color: #d8d8d8; background-size: cover; -webkit-background-size: cover; -moz-background-size: cover; -o-background-size: cover;">'+
                                        '<div class="ui-li-price">'+
                                            '<div class="ui-text-price">'+
                                                '<span class="title">Desde</span>'+
                                                '<span class="desc">'+price+'</span>'+
                                            '</div>'+
                                            '<div class="ui-price-logo">'+
                                                '<img class="logo" src="'+logo+'">'+
                                            '</div>'+
                                        '</div>'+
                                    '</div>'+
                                '</li>'+
                                '';
                        $("#list_project").append(html);
                        
                    });
                    setTimeout(Vivendo.initProject(), 1000);
                } else {
                  
                  Vivendo.loading(false);
                  AppData.page = PAGE_PROJECT;
                  AppData.processing = false;
                  $("#type_popup").append('<span class="message">No se encontraron resultados.</span>');
                  $("#type_popup").find('#list_type').hide();
                  $("#type_popup").find('.message').show();
                  $("#type_popup").popup('open');
                  
                }
                
            },
            error: function (data) {
                AppData.processing = false;
                Vivendo.loading(false);
            }
        });
    },

    initSearch: function(){
        Vivendo.loading(false);
        AppData.page = PAGE_SEARCH;
        AppData.processing = false;
        AppData.type_id='0';
        
        var city = AppData.city_name;
        var zone = 'Todos';
        var construct = 'Todos';
        var tipo = 'Todos';
        
        if (AppData.browse=='zone') {
            zone = AppData.zone_name;
        }
        if (AppData.browse=='construct') {
            construct = AppData.construct_name;
        }
        
        city = city=='' ? 'Todos' : city;
        zone = zone=='' ? 'Todos' : zone;
        construct = construct=='' ? 'Todos' : construct;
        
        $("#list_search li[data-kind='city'] .ui-li-text h6").html(city);
        
      if ( zone !== 'Todos' ) {
          $("#list_search li[data-kind='zone']").show().find(".ui-li-text h6").html(zone);
          $("#list_search li[data-kind='construct']").hide();
        } else {
          $("#list_search li[data-kind='zone']").hide();
          $("#list_search li[data-kind='construct']").show().find(".ui-li-text h6").html(construct);
        }
        //$("#list_search li[data-kind='zone'] .ui-li-text h6").html(zone);
        //$("#list_search li[data-kind='construct'] .ui-li-text h6").html(construct);
        $("#list_search li[data-kind='type'] .ui-li-text h6").html(tipo);
        
        this.changePage("#pg_search", "slide");
        
    },
    
     ////////////////////////////////////////////////////////////////////////////////////////////inicio planos
            getPlanos : function(){
      
         Vivendo.loading(true);
        AppData.processing = true;
           planoscuerpo = '';
           
          //  $("#accordion").remove();
          
           $("#accordion").html('');
            
        
        $.ajax({
            type: 'POST',
            data: { },
            url: 'http://www.vivendo.co/services/plantaproyecto/'+AppData.project_id,
            success: function (data) {
                if (data.nodes) {
                    $.each(data.nodes, function(index, row){
                        var etiqueta=row.node.Etiqueta;
                        var images=row.node.images;
                        var idplant= row.node.id;
                   
                      
                         if (row.node.images!=null && row.node.images!=''){
                        
                        
                                   
                       
                        
                        
                                  
                       html =   '<div class="panel panel-default">'+
           '<div class="panel-heading">'+
                '<h4 class="panel-title">'+
                    '<a data-toggle="collapse" data-parent="#accordion" class="collapsed" aria-expanded="false" href="#'+idplant+'">'+etiqueta+'</a>'+
                '</h4>'+
            '</div>'+
            '<div id="'+idplant+'" class="panel-collapse collapse aria-expanded="false">'+
                '<div class="panel-body">'+
                    '<p><img  src="'+images+'" alt=""></p>'+
               ' </div>'+
            '</div>'+
        '</div>';
        

  $("#h1planta").css("display","block")
}                         
                            
                                
                               
                             //$("#acordionstyle li[data-have='1']").remove(); 
                                $("#accordion").append(html);
                        
                      //   h_images = '<div class="item"><img height="150" width="150" src="'+images+'" alt=""></div>';
                       
                     //    $("#accordion").append(html);
                          $("#list_planos_etiqueta").append(etiqueta);
                         
                         
                    });
                          
                   
                } 
                
              //  setTimeout(Vivendo.initConstruct(), 1000);
            },
            error: function (data) {
                AppData.processing = false;
                Vivendo.loading(false);
            }
        });//////////////////////////////////////////////////////////////////////////////////////// fin 
        
    },
    
    getDetail: function(){
        Vivendo.loading(true);
        AppData.processing = true;
        $("#h1planta").css("display","none")
        //init component.
        $("#list_detail li[data-have='1']").remove();
        $("#list_detail .ui-li-form .ui-li-address span.desc").html('');
        $("#list_detail .ui-li-form .ui-li-address a.button-sm").addClass('disabled');
        $("#frm_info").bootstrapValidator('resetForm', true);
        
        $.ajax({
            type: 'POST',
            data: { },
            url: 'http://www.vivendo.co/services/project/'+AppData.project_id,
            success: function (data) {
                if (data.nodes) {
                    var html="";
                    var videolink="";
                     var h_video ="";
                    $.each(data.nodes, function(index, row){
                        var n=row.node.title;
                        var t=row.node.Tipo;
                        var videolink=row.node.video;
                        var addr = row.node.address;
                        var price = row.node.price;
                        var logo = "img/icon.png";
                        var bg="img/background.png";
                        var b_logo = AppData.browse_logo;
                        var image_count = 0;
                        var builder_address = row.node.builder_address;
                        var phone ='tel:'+ row.node.phone;
                        var ruta = row.node.ruta;
  
                        var wwwvivendo = 'http://www.vivendo.co';

                        var wwwvivendo = wwwvivendo+ruta;
  
                   var strruta =  '<a class=\"right\" style=\"padding-top: 0px !important;\" onclick=\"window.plugins.socialsharing.share(\''+n+'\', null, null, \''+wwwvivendo+'\')\"><img src=\"assets\/img\/upload.png\" style=\"width: 18px; padding-right: 2px; padding-bottom: 2px;\" ><\/a>'; 
                        $("#ruta").prepend(strruta);
                        
                        
                        
         
                          
                       
                        
                        var h_images='';
                        
                        builder_address = builder_address!=null && builder_address!='' ? builder_address : '';
                        phone = phone!=null && phone!='' ? phone : '';
                        
                        AppData.project_phone=phone;
             
             
                        if (row.node.logo!=null && row.node.logo!=''){
                            logo = row.node.logo;
                        }
                        if (row.node.builder_logo!=null && row.node.builder_logo!=''){
                            b_logo = row.node.builder_logo;
                        }
                        
                        if (t==null || t==''){
                            t="&nbsp;";
                        }
                        if (n==null || n==''){
                            n="&nbsp;";
                        }
                        if (addr==null || addr==''){
                            addr="&nbsp;";
                        }
                        if (price==null || price==''){
                            price="$0";
                        }

                        var info1 = row.node.barrio;
                        var info2 = row.node.estrato;
                        var info3 = t;
                        var info4 = row.node.habitaciones;
                        var info5 = row.node.banos;
                        var info6 = row.node.area_construida;
                        var info7 = row.node.area_privada;
                        var isInfo = false;
                        
                        var telefonito = 'tel:'+ row.node.phone;
                        var telefonito2 = row.node.phone;
                        var telefonito3 = AppData.project_phone;
                        
                        info1 = info1!=null && info1!='' ? info1 : '';
                        info2 = info2!=null && info2!='' ? info2 : '';
                        info3 = info3!=null && info3!='' ? info3 : '';
                        info4 = info4!=null && info4!='' ? info4 : '';
                        info5 = info5!=null && info5!='' ? info5 : '';
                        info6 = info6!=null && info6!='' ? info6 : '';
                        info7 = info7!=null && info7!='' ? info7 : '';
                        
                        if (info1!='' || info2!='' || info3!='' || info4!='' || info5!='' || info6!='' || info7!='' || (row.node.interior_features!=null && row.node.interior_features!='') || (row.node.exterior_features!=null && row.node.exterior_features!='') ){
                            isInfo = true;
                        }


                        // IMAGENES GALERIA
                        if (row.node.images!=null && row.node.images!=''){
                            var ii = row.node.images.split(",");
//                            bg=ii[0];
                            image_count = ii.length;
                            
                            AppData.image_count = image_count;
                            AppData.images = Array();
                            $.each(ii, function(i_image, url){
                                AppData.images[i_image]= { href: $.trim(url), title: n };
                                
                                /*if (!i_image){
                                  widget = '<div class="ui-li-price">'+
                                            '<div class="ui-text-price">'+
                                                '<span class="title">Desde</span>'+
                                                '<span class="desc">'+price+'</span>'+
                                            '</div>'+
                                            '<div class="ui-price-logo">'+
                                                '<img class="logo" src="'+logo+'">'+
                                            '</div>'+
                                        '</div>';
                                } else {
                                  widget = '';
                                }*/
                                
                          /*      var parametrosyoutube = '?rel=0&amp;controls=0&amp;showinfo=0';
                                 if (row.node.video!=null && row.node.video!=''){
                                      h_images += ''+row.node.video+'';
                                                                            
                                      
                                 }else{*/
                             

                                       h_images += '<div class="item"><img src="'+$.trim(url)+'" alt=""></div>'; 
                               /*  }*/
                                
                             
                            });
                        }//FIN IMAGENES GALERIA
                        
                          if (videolink !=null && videolink !=''){
                            
                            var videofinal = videolink.split("=")[1].split("&");
                        
                         
                         
            
       

                            var   h_video = '<div class="item"><iframe class="youtube-player" type="text/html" width="100%" height="255" src="http://www.youtube.com/embed/'+videofinal+'" frameborder="0" allowfullscreen></iframe></div>';
                         
                         
                         }else{
                            var videofinal = "";
                             var   h_video = "";
                          }

                             
                      //   var   h_video = '<div class="item"><iframe width="100%" height="255" src="http://www.youtube.com/embed/oHg5SJYRHA0?autoplay=1" frameborder="0" allowfullscreen></iframe></div>';
                      
                        
                        if (row.node.coordinates!=null || row.node.coordinates!=''){
                            var ll = row.node.coordinates.split(',');
                            if (ll.length==2){
                                var lat = ll[0];
                                var lon = ll[1];
                            }
                        }
                        
                        html += ''+
                                '<li data-have="1">'+
                                    '<div class="row ui-li-content">'+
                                        '<img class="photo" src="'+b_logo+'">'+
                                        '<div class="ui-li-text">'+
                                            '<h6>'+t+'</h6>'+
                                            '<h4>'+n+'</h4>'+
                                            '<h5>'+addr+'</h5>'+
                                        '</div>'+
                                    '</div>'+
                                    '<div class="row ui-li-content ui-li-additional" >'+
                                        '<div class="ui-li-price">'+
                                            '<div class="ui-text-price">'+
                                                '<span class="title">Desde</span>'+
                                                '<span class="desc">'+price+'</span>'+
                                            '</div>'+
                                            '<div class="ui-price-logo">'+
                                                '<img class="logo" src="'+logo+'">'+
                                            '</div>'+
                                        '</div>'+
                                        '<div class="row ui-li-slider">'+
                                            '<div id="project_images" class="owl-carousel owl-theme">'+
                                            h_images+h_video+
                                            '</div>'+
                                        '</div>'+
                                        '<div class="ui-li-image">'+
                                            '<img class="count" src="assets/img/photo.png">'+
                                            '<div class="ui-text-image">'+
                                                '<span class="desc">'+image_count+'</span>'+
                                            '</div>'+
                                        '</div>'+
                                    '</div>'+
                                '</li>'+
                                '';
                        if (isInfo) {
                            html += ''+
                                    '<li data-have="1">'+
                                        '<div class="row ui-li-data">'+
                                            '<h1>Especificaciones</h1>'+
                                    ''+
                                '';
                        
                            if ( (row.node.interior_features!=null && row.node.interior_features!='') ||
                                    (row.node.exterior_features!=null && row.node.exterior_features!='') ){

                                html += ''+
                                            '<table>'+
                                                '<tr>'+
                                        ''+
                                    '';

                                if (row.node.interior_features!=null && row.node.interior_features!='') {
                                    html += ''+
                                                    '<td style="vertical-align:top;">'+
                                                        '<h3>Interiores</h3>'+
                                                        '<ul class="feature">'+
                                         '';

                                    var i_features = row.node.interior_features.split(",");
                                    $.each(i_features, function(index_feature, feature1){
                                        var f=$.trim(feature1);
                                        if (f!='') {
                                            html += '<li><img class="icon-16" src="assets/img/check.png"><span>'+f+'</span></li>';
                                        }
                                    });

                                    html += ''+
                                                        '</ul>'+
                                                    '</td>'+
                                         '';
                                }

                                if (row.node.exterior_features!=null && row.node.exterior_features!='') {
                                    html += ''+
                                                    '<td style="vertical-align:top;">'+
                                                        '<h3>Exteriores</h3>'+
                                                        '<ul class="feature">'+
                                         '';

                                    var i_features = row.node.exterior_features.split(",");
                                    $.each(i_features, function(index_feature, feature2){
                                        var f=$.trim(feature2);
                                        if (f!='') {
                                            html += '<li><img class="icon-16" src="assets/img/check.png"><span>'+f+'</span></li>';
                                        }
                                    });

                                    html += ''+
                                                        '</ul>'+
                                                    '</td>'+
                                         '';
                                }

                                html += ''+
                                                '</tr>'+
                                            '</table>'+
                                        ''+
                                    '';
                            }
                            
                            if (info1!='' || info2!='' || info3!='' || info4!='' || info5!='' || info6!='' || info7!='') {
                                var i_info=0;
                                var c_info=[ "odd", "even" ];
                                
                                html += ''+
                                            '<table class="info">'+
                                        ''+
                                    '';
                                
                                if (info1!='') {
                                    html += ''+
                                                '<tr class="'+c_info[i_info%2]+'">'+
                                                    '<td>Barrio</td>'+
                                                    '<td>'+info1+'</td>'+
                                                '</tr>'+
                                            ''+
                                        '';
                                    i_info++;
                                }
                                    
                                if (info2!='') {
                                    html += ''+
                                                '<tr class="'+c_info[i_info%2]+'">'+
                                                    '<td>Estrato</td>'+
                                                    '<td>'+info2+'</td>'+
                                                '</tr>'+
                                            ''+
                                        '';
                                    i_info++;
                                }
                            
                                if (info3!='') {
                                    html += ''+
                                                '<tr class="'+c_info[i_info%2]+'">'+
                                                    '<td>Tipo</td>'+
                                                    '<td class="tipo">'+info3+'</td>'+
                                                   '<td class="tipo">'+videofinal+'</td>'+
                                                    
                                                    
                                  
                                               
                                               
                                               '</tr>'+
                                            ''+
                                        '';
                                    i_info++;
                                }

                                if (info4!='') {
                                    html += ''+
                                                '<tr class="'+c_info[i_info%2]+'">'+
                                                    '<td>Habitaciones</td>'+
                                                    '<td>'+info4+' </td>'+
                                                '</tr>'+
                                            ''+
                                        '';
                                    i_info++;
                                }
                                
                                if (info5!='') {
                                    html += ''+
                                                '<tr class="'+c_info[i_info%2]+'">'+
                                                    '<td>Baños</td>'+
                                                    '<td>'+info5+'</td>'+
                                                '</tr>'+
                                            ''+
                                        '';
                                    i_info++;
                                }

                                if (info6!='') {
                                    html += ''+
                                                '<tr class="'+c_info[i_info%2]+'">'+
                                                    '<td>Area construida</td>'+
                                                    '<td>'+info6+'</td>'+
                                                '</tr>'+
                                            ''+
                                        '';
                                    i_info++;
                                }
                                
                                if (info7!='') {
                                    html += ''+
                                                '<tr class="'+c_info[i_info%2]+'">'+
                                                    '<td>Area privada</td>'+
                                                    '<td>'+info7+'</td>'+
                                                '</tr>'+
                                            ''+
                                        '';
                                    i_info++;
                                }
                                
                                html += ''+
                                            '</table>'+
                                        ''+
                                    '';
                            }
                        
                            html += ''+
                                        '</div>'+
                                    '</li>'+
                                    ''+
                                '';
                        }
                        
                        if (row.node.description!=null && row.node.description!='') {
                            html += ''+
                                '<li data-have="1">'+
                                    '<div class="row ui-li-data">'+
                                        '<h1>Descripción</h1>'+
                                        '<p>'+row.node.description+'</p>'+
                                    '</div>'+
                                '</li>'+
                                '';
                        }
                        
                        var htmlphone ='';
                        
                        $("#list_detail .ui-li-form .ui-li-address span.desc").html(builder_address);
                        $("#list_detail .ui-li-form img.logo").attr('src', b_logo);
                        if (AppData.project_phone!='') {
                            $("#list_detail .ui-li-form .ui-li-address a.button-sm").removeClass('disabled');
                        }
                        
                         if (row.node.phone!=null && row.node.phone!='') {
                            htmlphone += ''+'<a href="'+telefonito+'" class="ui-btn button-sm" style="width: 120px; margin-top: 8px;">LLAMAR</a>'+ '';
                        }
                         $("#telefonoios").html(htmlphone);
                        
                        
                        $('#project').val(row.node.title);
                        $('#construct').val(row.node.construct);
                        
                    });
                    
                    $("#list_detail").prepend(html);
                    
                    
                } 
                
                setTimeout(Vivendo.initDetail(), 1000);
            },
            error: function (data) {
                AppData.processing = false;
                Vivendo.loading(false);
            }
        });
   
            },   
        
    initDetail: function(){
        Vivendo.loading(false);
        AppData.page = PAGE_DETAIL;
        AppData.processing = false;
        
        if ($("#project_images div.item").length>0){
        	$("#project_images").owlCarousel({
    		      navigation : false, // Show next and prev buttons
    		      slideSpeed : 300,
    		      paginationSpeed : 400,
//    		      singleItem: true
    		      // "singleItem:true" is a shortcut for:
                  items : 1, 
                  itemsDesktop : false,
                  itemsDesktopSmall : false,
                  itemsTablet: true,
                  itemsMobile : true,
                  afterMove: function(){
                    if ( $('.owl-pagination').find('.owl-page').first().hasClass('active') ){ 
                      $('.ui-price-logo').show(); 
                    } else {  
                      $('.ui-price-logo').hide(); 
                    }
                  }
    		  });    		
    	}
        
        this.changePage("#pg_detail", "slide");
    },
    
    backCity: function(){
        AppData.init();
        Vivendo.initCity();
    },
    
    onShare: function(){
        console.log('Share');
        window.plugins.share.show(
          {
            subject: 'vivendo.co',
            text: 'vivendo.co'
          },
          function() {}, // Success function
          function() {alert('Share failed')} // Failure function
        );
       socialsharing.share(AppData.project_name, 'Vivendo', null, "http://www.vivendo.co", this.onShareSuccess, this.onShareFail);
    },
    onEmail: function(){
      
       window.plugins.socialsharing.shareViaEmail( $("#comment").val(), $("#subject").val(), [$("#email").val()], null, null, null, this.onShareSuccess, this.onShareFail);
        $.ajax({
          url: 'http://www.vivendo.co/send-mail-contruct',
          type: 'GET',
          data: {
            name:      $('#firstname').val().toString(),
            lastName:  $('#lastname').val().toString(),
            email:     $('#email').val().toString(),
            telephone: $('#phone').val().toString(),
            country:   $('#subject').val().toString(),
            city:      $('#address').val().toString(),
            comment:   $('#comment').val().toString(),
            project:   $('#project').val(),
            construct: $('#construct').val()
          },
          success: function( response ){
            //console.log('entro');
          }
          
        });
        $("#send_popup").popup('open');
        $('#frm_info').find('.button').removeAttr('disabled');
    },
    
    onShareSuccess: function(msg){
        preventRunDefault = false;
        $("#frm_info").bootstrapValidator('resetForm', false);
    },
    onShareFail: function(msg){
        preventRunDefault = false;
        $("#frm_info").bootstrapValidator('resetForm', false);
    },
    
    onPhoneCall: function(){
        console.log('Phone Dial');
        //phonedialer.dial(AppData.project_phone, this.onPhoneFail, this.onPhoneSuccess);
        window.plugins.webintent.startActivity({
            action: window.plugins.webintent.ACTION_VIEW,
            url: 'tel:'+AppData.project_phone},
            function() {},
            function() {alert('Failed to open URL via Android Intent')}
        );
    },
    onPhoneSuccess: function(msg){
    },
    onPhoneFail: function(msg){
        if (msg == "feature") {
//            alert("Your device doesn't support this feature.");
        }
        if (msg == "empty") {
//            alert("Unknown phone number");
        }
    },
    
    onResize: function() {
        $("#map_container").height($(window).height()-150);
    },
    
};

app.initialize();

var map=null;
//$(document).on( "mobileinit", function() {
//});

function _render_info_project( dataProject ){
  
  var output = '';


  var test = dataProject.id;
  var funct = '_redirect_project(id=\''+dataProject.id+'\', title=\''+dataProject.title+'\');';

  output += '<div class="window-project">';
  output +=   '<a class="click-window" onclick="'+funct+'" href="#">';
  output +=   '<div class="col-left">';
  output +=     '<img src="' + dataProject.logo + '" title="' + dataProject.title + '" alt="' + dataProject.title + '"/>';
  output +=   '</div>';
  output +=   '<div class="col-right">';
  output +=     '<span class="title">' + dataProject.title + '</span>';
  output +=     '<span class="price">' + dataProject.price + '</span>';
  output +=     '<span class="address">' + dataProject.type + '</span>';
  output +=   '</div>';
  output +=   '</a>';
  output += '</div>';

  return output;
}

function _redirect_project(id, title){
  AppData.project_id = id;
  AppData.project_name = title;
  Vivendo.getDetail();
  Vivendo.getPlanos();
  
}

jQuery(document).ready(function () {
    isDocumentReady = true;
    //Vivendo.init();

    Vivendo.onResize();

    $('#pg_city').bind('pageinit', function() {
        $('#list_city').listview('refresh');
    });

    $('#pg_zone').bind('pageinit', function() {
        $('#list_zone').listview('refresh');
    });

    $('#pg_construct').bind('pageinit', function() {
        $('#list_construct').listview('refresh');
    });
    
    $('#pg_project').bind('pageinit', function() {
        $('#list_project').listview('refresh');
    });

    $("#pg_project").live('pagecreate', function(){});
    
    $("#pg_project").live('pageshow', function(){
      
      var locations = new Array(AppData.locations.length);
      
      var bounds     = new google.maps.LatLngBounds();
      var infowindow = new google.maps.InfoWindow();
      
      for ( var j=0; j<AppData.locations.length; j++){
        var latLon   = AppData.locations[j].latLng;
        var info     = _render_info_project(AppData.locations[j].data);
        locations[j] = [info, latLon[0], latLon[1]];
      }

      var map = new google.maps.Map(document.getElementById('map_project'), {
        zoom: 10,
        center: new google.maps.LatLng(4.570868, -74.297333),
        mapTypeId: google.maps.MapTypeId.ROADMAP
      });

      var infowindow = new google.maps.InfoWindow();

      var marker, i;

      for (i = 0; i < locations.length; i++) {  
        marker = new google.maps.Marker({
          position: new google.maps.LatLng(locations[i][1], locations[i][2]),
          map: map,
          icon: 'http://www.vivendo.co/sites/all/themes/at-vivendo/images/icons/marker-small.png',
        });
        
        bounds.extend(marker.position);

        google.maps.event.addListener(marker, 'click', (function(marker, i) {
          return function() {
            infowindow.setContent(locations[i][0]);
            infowindow.open(map, marker);
            $('.gm-style-iw').each(function(i){
              $(this).prev().hide();
              $(this).next().html('<img src="http://vivendo.co/sites/all/themes/at-vivendo/images/icons/close-red.png" />').css({'top': '15px', 'right': '5px'});
            });
            
            /*$(".window-project").each(function(i){
              console.log(i);
            });*/
          }
        })(marker, i));
      }
      
      map.fitBounds(bounds);
      
      
        
    });
    
    $('#pg_search').bind('pageinit', function() {
        if (Vivendo.price.length==0) {
            $("#slider_price").attr('max', 0);
            $("#slider_price").attr('value', 0);
        } else {
            $("#slider_price").attr('max', Vivendo.price.length-1);
            $("#slider_price").attr('value', 0);
            $("#list_search li[data-kind='price'] .ui-li-text h6").html(Vivendo.price[0].name);
        }
        $("#slider_price").slider('refresh');
        
        $("#slider_price").on('slidestop', function(e){
            if (Vivendo.price.length==0) {
                $("#list_search li[data-kind='price'] .ui-li-text h6").html('');
                return false;
            }

            var t = $("#slider_price").val();
            $("#list_search li[data-kind='price'] .ui-li-text h6").html(Vivendo.price[parseInt(t)].name);
        });
        
        $('#list_search').listview('refresh');
    });

    $('#pg_detail').bind('pageinit', function() {
        $('#list_detail').listview('refresh');
    });
    
//    $("#pg_detail").live('pageshow', function(){
//    });
    
    $("#city_popup").popup( { transition: 'slide' , shadow: false , corners: false } );
    $("#type_popup").popup( { transition: 'pop' , shadow: false , corners: false } );
    $("#map_popup").popup( { transition: 'flip' , shadow: false , corners: false, dismissible: false } );
    $("#alert_popup").popup( { transition: 'pop' , shadow: false , corners: false } );
    
//    $('#city_popup').on('popupafteropen', function () {
//        $(this).one('popupafterclose', function () {
//            $(window).one('navigate.popup', function (e) {
//                e.preventDefault();
//                e.stopImmediatePropagation();
//            });
//        });
//    });
//    $(".ui-popup-screen").on('tap', function(e){
//        e.preventDefault();
//        e.stopImmediatePropagation();
//        e.stopPropagation();
//    });
  
    $("#pg_project .ui-tab").tabs( { collapsible: true } );

    $("#list_city").on('tap', "li", function(e){
        e.preventDefault();
        e.stopImmediatePropagation();
        
        if ($(this).attr('data-have')=='0'){
            return false;
        }
        
        if (AppData.processing){
            return false;
        }
        
        var id = $(this).attr('data-id');
        if (id=='' || id=='0'){
            return false;
        }
        
        AppData.city_id = id;
        var t1=$("#list_city li[data-id='"+id+"'] .ui-li-text span.title").html();
        var t2=$("#list_zone li[data-id='"+id+"'] .ui-li-text span.desc").html();
        t1 = t1==null || t1==undefined ? '' : t1;
        t2 = t2==null || t2==undefined ? '' : t2;
        AppData.city_name = t1 + t2;
        
        var w = $(this).width();
        var h = $(this).height();
        var pos = $(this).position();
        
//        $("#city_popup-popup").css('left', '120px');
//        $("#city_popup-popup").css('top', pos.top+'px');
        $("#city_popup").css('width', (w-120+3)+'px');
        $("#city_popup").popup('open', {   y: pos.top+h/2+1  });
    });

    // popup over menu action
    $("#city_popup>.menu-group").on('tap', 'a', function(e){
        e.preventDefault();
        e.stopImmediatePropagation();
        
        if (AppData.processing){
            return false;
        }
        
        if (AppData.city_id=='0'){
            return false;
        }
        
        if ($(this).hasClass('zona')){
            $("#city_popup").popup('close');
            Vivendo.getZones();
        }
        
        if ($(this).hasClass('construct')){
            $("#city_popup").popup('close');
            Vivendo.getConstructs();
        }
    });

    $("#list_zone").on('tap', "li[data-have='1']", function(e){
        e.preventDefault();
        e.stopImmediatePropagation();
        
        if (AppData.processing){
            return false;
        }
        
        var id = $(this).attr('data-id');
        if (id=='' || id=='0'){
            return false;
        }
        
        var t1 = $("#list_zone li[data-id='"+id+"'] .ui-li-text span.title").html();
        var t2 = $("#list_zone li[data-id='"+id+"'] .ui-li-text span.desc").html();
        t1 = t1==null || t1==undefined ? '' : t1;
        t2 = t2==null || t2==undefined ? '' : t2;
        
        var name = t1 + t2;
        
        AppData.initConstruct();
        
        AppData.zone_id = id;
        AppData.zone_name = name;
        
        AppData.browse = 'zone';
        AppData.browse_title = name;
        AppData.browse_logo = 'img/icon.png';
        
        // init html element - missing.  later
        Vivendo.getProjectByZone();
    });

    $("#list_construct").on('tap', "li[data-have='1']", function(e){
        e.preventDefault();
        e.stopImmediatePropagation();
        
        if (AppData.processing){
            return false;
        }
        
        var id = $(this).attr('data-id');
        if (id=='' || id=='0'){
            return false;
        }
        
        var t1 = $("#list_construct li[data-id='"+id+"'] .ui-li-text span.title").html();
        var t2 = $("#list_zone li[data-id='"+id+"'] .ui-li-text span.desc").html();
        t1 = t1==null || t1==undefined ? '' : t1;
        t2 = t2==null || t2==undefined ? '' : t2;
        var name = t1 + t2;
        
        AppData.initZone();
        
        AppData.construct_id = id;
        AppData.construct_name = name;
        
        AppData.browse = 'construct';
        AppData.browse_title = name;
        AppData.browse_logo = $("#list_construct li[data-id='"+id+"'] .ui-li-content img.photo").attr('src');
        
        // init html element - missing.  later
        Vivendo.getProjectByConstruct();
    });

    $("#list_project").on('tap', "li[data-have='1']", function(e){
        e.preventDefault();
        e.stopImmediatePropagation();
        
        if (AppData.processing){
            return false;
        }
        
        var id = $(this).attr('data-id');
        if (id=='' || id=='0'){
            return false;
        }
        
        var name = $("#list_construct li[data-id='"+id+"'] .ui-li-content .ui-li-text h4").html();
        AppData.project_id = id;
        AppData.project_name = name;
        
        Vivendo.getDetail();
         Vivendo.getPlanos();
        
    });

    /*$(".window-project a").on('tap', function(e){
        e.preventDefault();
        e.stopImmediatePropagation();
        
        if (AppData.processing){
            return false;
        }
        
        var id = $(".window-project").attr('data-id');
        if (id=='' || id=='0'){
            return false;
        }
        
        console.log('hola mundo');

        //$("#map_popup").popup('close');
        
        AppData.project_id = id;
        AppData.project_name = $(".window-project span.title").html();
        
        Vivendo.getDetail();
    });*/

    $("#list_search").on('tap', "li", function(e){
        e.preventDefault();
        e.stopImmediatePropagation();
        
        if (AppData.processing){
            return false;
        }
        
        var t = $(this).attr('data-kind');
        if (t=='city') {
            AppData.init();
            Vivendo.initCity();
            return true;
        }
        
        if (t=='zone') {
            if (AppData.browse=='zone') {
                AppData.initCity();
                Vivendo.initZone();
                return true;
            }
        }
        
        if (t=='construct') {
            if (AppData.browse=='construct') {
                AppData.initCity();
                Vivendo.initConstruct();
                return true;
            }
        }
        
        if (t=='type') {
            if (Vivendo.type.length>0){
                $("#type_popup").find('.message').hide();
                $("#type_popup").find('#list_type').show();
                $("#type_popup").popup('open');
                
            }
        }
    });
    
    $("#list_search").on('tap', 'a.button', function(e){
        e.preventDefault();
        e.stopImmediatePropagation();

        if (AppData.processing){
            return false;
        }

        // buscar button event
        Vivendo.search();
    });

    $("#list_detail").on('tap', 'a.button-sm', function(e){
        e.preventDefault();
        e.stopImmediatePropagation();

        if (AppData.processing){
            return false;
        }
        // LLMVR button event
        if (AppData.project_phone!='') {
            Vivendo.onPhoneCall();
        }
    });
    
    $("#list_detail").on('tap', 'div.ui-li-additional', function(e){
        e.preventDefault();
        e.stopImmediatePropagation();
        
        if (AppData.image_count==0){
            return false;
        }
        
//        $.fancybox( AppData.images );         
    });

    $("#list_type").on('tap', 'li', function(e){
        e.preventDefault();
        e.stopImmediatePropagation();

        if (AppData.processing){
            return false;
        }
        
        var index = $(this).attr('data-id');
        AppData.type_id = Vivendo.type[parseInt(index)].id;
        $("#list_search li[data-kind='type'] .ui-li-text h6").html(Vivendo.type[parseInt(index)].name);
        $("#type_popup").popup('close');
    });

    $('#frm_info').bootstrapValidator({
        excluded: ':disabled',
        feedbackIcons: {
            valid: 'has-success',
            invalid: 'has-error',
            validating: ''
        }
    })
    .on('success.field.bv', function (e, data) {
        if (data.bv.isValid()) {
            data.bv.disableSubmitButtons(false);
        }
    });
    
    $("#frm_info").on("valid invalid submit", function (event) {
        event.stopPropagation();
        event.preventDefault();
        
        if (event.type == 'submit') {
            if ($("#frm_info .has-error").length == 0) {
                if (!preventRunDefault) {
                    preventRunDefault = true;
                    
                    // ENVIAR button event
                    Vivendo.onEmail();
                }
            } else {
                $("#frm_info").bootstrapValidator('resetForm', false);
            }
        };
    });
    

    
//    Header Action
    $("#pg_zone>.header>.menu-group").on('tap', 'a', function(e){
        e.preventDefault();
        e.stopImmediatePropagation();
        
        if (AppData.processing){
            return false;
        }
        
        if ($(this).hasClass('left')){
            Vivendo.backCity();
        }
    });

    $("#pg_construct>.header>.menu-group").on('tap', 'a', function(e){
        e.preventDefault();
        e.stopImmediatePropagation();
        
        if (AppData.processing){
            return false;
        }
        
        if ($(this).hasClass('left')){
            Vivendo.backCity();
        }
    });

    $("#pg_project>.header>.menu-group").on('tap', 'a', function(e){
        e.preventDefault();
        e.stopImmediatePropagation();
        
        if (AppData.processing){
            return false;
        }
        
        if ($(this).hasClass('left')){
            Vivendo.backCity();
        }
        
        if ($(this).hasClass('right')){
            Vivendo.initSearch();
        }
    });
    
    $("#pg_search>.header>.menu-group").on('tap', 'a', function(e){
        e.preventDefault();
        e.stopImmediatePropagation();
        
        if (AppData.processing){
            return false;
        }
        
        if ($(this).hasClass('left')){
            Vivendo.initProject();
        }
    });
    $("#pg_search form").on('submit', function(e){
        console.log('Form Submit');
        e.preventDefault();
        e.stopImmediatePropagation();
        
        if (AppData.processing){
            return false;
        }
    });

    $("#pg_detail>.header>.menu-group").on('tap', 'a', function(e){
        e.preventDefault();
        e.stopImmediatePropagation();
        
        if (AppData.processing){
            return false;
        }
        
        if ($(this).hasClass('left')){
            Vivendo.initProject();
        }
        
        if ($(this).hasClass('right')){
            // share button event
            Vivendo.onShare();
        }
    });
    
});
