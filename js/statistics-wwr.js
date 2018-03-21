/**
 * Created by szczepan on 17.09.17.
 */


function getDataFromDb(selectKid, startPeriod, endPeriod){
    var data = null;
    $.ajax({
        cache: false,
        type: "POST",
        datatype: "json",
        url: "admin-oerw/statistics-oerw.php",
        data: 'childName=' +selectKid + '&startPeriod=' + startPeriod + '&endPeriod=' + endPeriod,
        success: function (data) {
            console.log(data);


            return data;

        },
        error: function () {
            alert('Wystąpił następujący błąd przy sprawdzaniu bazy dzieci');
        }

    });
//return data;
}

//take resources from db and put them into dropdown
function loadKids() {


    $.ajax({
        url: "admin/json-kids.php",
        type: 'GET',
        //async: false,
        dataType: 'json',
        success: function (data) {
            $.each(data, function(i, kid) {
                $("#selectKids").append('<option value="' + kid.name + '">' + kid.name + '</option>');
                //console.log(kid.name);
            });
            //$('#selectKids').multiselect('rebuild');
            //$("#selectKids").trigger("chosen:updated");
        },
        error: function(data) {
            alert(data);
        }

    });
}
$(document).ready(function() {
    var actualMonth = moment().subtract("month");
    var previousMonth = moment().subtract(1, "month");
    var previousMonthStart = moment(previousMonth).startOf('month');
    var previousMonthEnd = moment(previousMonth).endOf('month');
    $('#daterange').daterangepicker({
        "ranges": {
            "Ten tydzień": [
                moment().day(1),
                moment().day(5)
            ],
            "Ten miesiąc": [
                moment(actualMonth).startOf('month'),
                moment(actualMonth).endOf('month')
            ],
            "Poprzedni miesiąc": [
                previousMonthStart,
                previousMonthEnd
            ],
            "rok szk. 17/18": [
                "01/09/2017",
                "31/08/2018"
            ]
        },
        "locale": {
            "format": "DD/MM/YYYY",
            "separator": " do ",
            "applyLabel": "Zastosuj",
            "cancelLabel": "Anuluj",
            "fromLabel": "Od",
            "toLabel": "Do",
            "customRangeLabel": "inny",
            "daysOfWeek": [
                "Nd",
                "Pn",
                "Wt",
                "Śr",
                "Czw",
                "Pt",
                "So"
            ],
            "monthNames": [
                "Styczeń",
                "Luty",
                "Marzec",
                "Kwiecień",
                "Maj",
                "Czerwiec",
                "Lipiec",
                "Sierpień",
                "Wrzesień",
                "Październik",
                "Listopad",
                "Grudzień"
            ],
            "firstDay": 1
        },
        "alwaysShowCalendars": true,
        "startDate": "01/09/2017",
        "endDate": "31/08/2018",
        "autoApply": false
    }, function (start, end, label) {
        console.log(start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD'));
    });
    var $table = $('#statisticTable');
    var $statisticGroupedTable = $('#statisticGroupedTable');
    var $addChildButton = $('#addChildButton');
    var $submitButton = $('#submitButton');



    var data1 = 0;
    var startPeriod = 0;
    var endPeriod = 0;
    loadKids();
    //configure multiseletc plugin for resources dropdown
    $('#selectKid').multiselect({

        checkboxName: "myuniquename",//<--it fixes problem with multi select radio :)
        nonSelectedText: 'Wybierz dziecko',
        maxHeight: 300,
        buttonWidth: '150px',
        enableFiltering: true,
        enableHTML: true,
        filterPlaceholder: 'Szukaj',
        buttonClass: 'btn btn-white btn-primary',
        templates: {
            button: '<button type="button" class="multiselect dropdown-toggle" data-toggle="dropdown"><span class="multiselect-selected-text"></span> &nbsp;<b class="fa fa-caret-down"></b></button>',
            ul: '<ul class="multiselect-container dropdown-menu"></ul>',
            filter: '<li class="multiselect-item filter"><div class="input-group"><span class="input-group-addon"><i class="fa fa-search"></i></span><input class="form-control multiselect-search" type="text"></div></li>',
            filterClearBtn: '<span class="input-group-btn"><button class="btn btn-default btn-white btn-grey multiselect-clear-filter" type="button"><i class="fa fa-times-circle red2"></i></button></span>',
            li: '<li><a tabindex="0"><label></label></a></li>',
            divider: '<li class="multiselect-item divider"></li>',
            liGroup: '<li class="multiselect-item multiselect-group"><label></label></li>'
        }

    });
    $('#selectStatistic').multiselect({

        checkboxName: "myuniquename2",//<--it fixes problem with multi select radio :)
        maxHeight: 300,
        buttonWidth: '200px',
        enableHTML: true,
        buttonClass: 'btn btn-white btn-primary',
        templates: {
            button: '<button type="button" class="multiselect dropdown-toggle" data-toggle="dropdown"><span class="multiselect-selected-text"></span> &nbsp;<b class="fa fa-caret-down"></b></button>',
            ul: '<ul class="multiselect-container dropdown-menu"></ul>',
            filter: '<li class="multiselect-item filter"><div class="input-group"><span class="input-group-addon"><i class="fa fa-search"></i></span><input class="form-control multiselect-search" type="text"></div></li>',
            filterClearBtn: '<span class="input-group-btn"><button class="btn btn-default btn-white btn-grey multiselect-clear-filter" type="button"><i class="fa fa-times-circle red2"></i></button></span>',
            li: '<li><a tabindex="0"><label></label></a></li>',
            divider: '<li class="multiselect-item divider"></li>',
            liGroup: '<li class="multiselect-item multiselect-group"><label></label></li>'
        },
        onChange: function(option, checked, select) {
            var data = $statisticGroupedTable.bootstrapTable('getData');
            var startGroupedPeriodForDropdown = $("#daterange").data('daterangepicker').startDate.format('YYYY-MM-DD');
            var endGroupedPeriodForDropdown = $("#daterange").data('daterangepicker').endDate.format('YYYY-MM-DD');
            var actualSelection = $('#selectStatistic option:selected').val();

            if (actualSelection == "inTeraphy"){
                $statisticGroupedTable.bootstrapTable('load', $.grep(data, function (row) { return moment(row.teraphy_start).isBetween(startGroupedPeriodForDropdown,endGroupedPeriodForDropdown); }));

            }else if(actualSelection == "outTeraphy"){
                $statisticGroupedTable.bootstrapTable('load', $.grep(data, function (row) { return moment(row.teraphy_end).isBetween(startGroupedPeriodForDropdown,endGroupedPeriodForDropdown); }));

            }else{
                $statisticGroupedTable.bootstrapTable('refresh');
            }

        }

    });


    //take resources from db and put them into dropdown
    function loadKids() {

        $.ajax({
            url: "admin/json-kids.php",
            type: 'GET',
            //async: false,
            dataType: 'json',
            success: function (data) {
                $("#selectKid").empty();
                $.each(data, function (i, kid) {
                    $("#selectKid").append('<option value="' + kid.name + '">' + kid.name + '</option>');
                });
                $("#selectKid").multiselect('rebuild');
            },
            error: function (data) {
                alert(data);
            }

        });
    }

//simple validation
    $('#selectKids-button').prop('disabled', true);
    $('#selectKids').on("select2:select", function (e) {
        $('#selectKids-button').prop('disabled', false);
    });

    $('#show-button').off('click');
    $('#show-button').on('click', function () {
        var selectKid = $('#selectKid option:selected').val();
        console.log(selectKid);
        var startPeriod = $("#daterange").data('daterangepicker').startDate.format('YYYY-MM-DD');
        var endPeriod = $("#daterange").data('daterangepicker').endDate.format('YYYY-MM-DD');

        console.log(startPeriod);
        console.log(endPeriod);
        //fill specialists table
        $table.bootstrapTable('destroy');
        $table.bootstrapTable({
            cache: false,
            method: "GET",
            datatype: "json",
            url: "admin/statistics-wwr.php",
            queryParams: function (p) {
                return {
                    type: 'specialists',
                    childName: selectKid,
                    startPeriod: startPeriod,
                    endPeriod: endPeriod
                };
            },
            columns: [{
                field: 'resourceName',
                title: 'Terapeuta',
                sortable: true,
                class: 'name2'
            }, {
                field: 'speciality',
                title: 'Specjalizacja',
                sortable: true,
                class: 'name'
            }, {
                field: 'totalEvents',
                title: 'Wszystkie',
                sortable: true,
                class: 'name'
            }, {
                field: 'passedEvents',
                title: 'Nieodwołane',
                sortable: true,
                class: 'name'
            }, {
                field: 'cancelEvents',
                title: 'Odwołane',
                sortable: true,
                class: 'name'
            }
            ]

        });
        //document.getElementById("containerTable").style.display="block";
        // document.getElementById("panelWithTableFooter").style.display="block";
        // $("#panelWithTable").text(selectKid+", zakres od "+startPeriod+" do "+endPeriod );
        // $("#panelWithTableFooter").text("Data sprawdzenia: "+moment().format('YYYY-MM-DD HH:mm:ss'));

        //fill events widget
        var normalE = 0;
        var studyE  = 0;
        var cancelE = 0;
        $.ajax({
            url: "admin/statistics-wwr.php",
            type: 'GET',
            //async: false,
            dataType: 'json',
            data: 'type=eventsTypes&startPeriod=' + startPeriod + '&endPeriod=' + endPeriod +'&childName=' +selectKid,
            success: function (data) {
                $.each(data, function (i, eventType) {

                    normalE = eventType.normalEvents;
                    studyE = eventType.studyEvents;
                    cancelE = eventType.cancelEvents;
                });
                if(normalE == null){
                    $('#normal-event').text(0);
                    $('#study-event').text(0);
                    $('#cancel-event').text(0);
                }else
                {
                    $('#normal-event').text(normalE);
                    $('#study-event').text(studyE);
                    $('#cancel-event').text(cancelE);
                }
            },
            error: function (data) {
                alert(data);
            }

        });

    });


    /***************************************************
     * Grouped statistics
     *
     ****************************************************/

    var startGroupedPeriod = $("#daterange").data('daterangepicker').startDate.format('YYYY-MM-DD');
    var endGroupedPeriod = $("#daterange").data('daterangepicker').endDate.format('YYYY-MM-DD');

    $statisticGroupedTable.bootstrapTable({
        cache: false,
        method: "GET",
        datatype: "json",
        url: "admin/statistics-wwr.php",
        queryParams: function (p) {
            return {
                type: 'statisticGroupedTable',
                startPeriod: startGroupedPeriod,
                endPeriod: endGroupedPeriod
            };
        },
        columns: [{
            field: 'child_id',
            title: 'ID',
            sortable: true
        }, {
            field: 'firstname',
            title: 'Imię',
            sortable: true
        }, {
            field: 'lastname',
            title: 'Nazwisko',
            sortable: true
        }, {
            field: 'teraphy_start',
            title: 'Data rozpoczęcia terapii',
            sortable: true

        }, {
            field: 'teraphy_end',
            title: 'Data zakończenia terapii',
            sortable: true

        }]
    });

    $('#daterange').on('hide.daterangepicker', function(ev, picker) {

        var startGroupedPeriod = $("#daterange").data('daterangepicker').startDate.format('YYYY-MM-DD');
        var endGroupedPeriod = $("#daterange").data('daterangepicker').endDate.format('YYYY-MM-DD');
        console.log(startGroupedPeriod);
        console.log(endGroupedPeriod);

        //fill specialists table
        $statisticGroupedTable.bootstrapTable('destroy');
        $statisticGroupedTable.bootstrapTable({
            cache: false,
            method: "GET",
            datatype: "json",
            url: "admin/statistics-wwr.php",
            queryParams: function (p) {
                return {
                    type: 'statisticGroupedTable',
                    startPeriod: startGroupedPeriod,
                    endPeriod: endGroupedPeriod
                };
            },
            columns: [{
                field: 'child_id',
                title: 'ID',
                sortable: true
            }, {
                field: 'firstname',
                title: 'Imię',
                sortable: true
            }, {
                field: 'lastname',
                title: 'Nazwisko',
                sortable: true
            }, {
                field: 'teraphy_start',
                title: 'Data rozpoczęcia terapii',
                sortable: true

            }, {
                field: 'teraphy_end',
                title: 'Data zakończenia terapii',
                sortable: true

            }]
        });
    });



});
