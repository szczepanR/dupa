/**
 * Created by Sz on 2015-08-11.
 */

function checkIfChildExist(firstname, lastname,groupName){
    var result = null;
    $.ajax({
        cache: false,
        type: "POST",
        datatype: "json",
        url: "admin-oerw/kidsAdd.php",
        //async: false, danger, don't know what how it will dangerous!!!!!
        async: false,
        data: 'type=checkIfExist'+'&firstName=' + firstname + '&lastName=' + lastname + '&groupName=' + groupName,
        success: function (response) {
            result = jQuery.parseJSON(response);

        },
        error: function (e) {
            alert('Wystąpił następujący błąd przy sprawdzaniu bazy dzieci' + e.responseText);
        }

    });
    return result;

}
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
        url: "admin-oerw/json-kids.php",
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



    var $table = $('#statisticTable');
    var $addChildButton = $('#addChildButton');
    var $submitButton = $('#submitButton');
    var actualMonth = moment().subtract("month");
    var previousMonth = moment().subtract(1,"month");
    var previousMonthStart = moment(previousMonth).startOf('month');
    var previousMonthEnd = moment(previousMonth).endOf('month');
    var data1 = 0;
    var startPeriod= 0;
    var endPeriod= 0;
    loadKids();
    //configure multiseletc plugin for resources dropdown
    $('#selectKids').select2({
        theme: "bootstrap",
        placeholder: "Wybierz dziecko",
        language: 'pl'
    }),

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
            "rok szk. 15/16": [
                "01/09/2015",
                "31/08/2016"
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
        "startDate": moment(),
        "endDate": moment()
    }, function(start, end, label) {
        console.log( start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD'));
    });

    //take resources from db and put them into dropdown
    function loadKids() {

        $.ajax({
            url: "admin-oerw/json-kids.php",
            type: 'GET',
            //async: false,
            dataType: 'json',
            success: function (data) {
                $.each(data, function(i, kid) {
                    $("#selectKids").append('<option value="' + kid.name + '">' + kid.name + '</option>');

                });
            },
            error: function(data) {
                alert(data);
            }

        });
    }
//simple validation
    $('#selectKids-button').prop('disabled', true);
    $('#selectKids').on("select2:select", function (e) { $('#selectKids-button').prop('disabled', false);});

    $('#selectKids-button').off('click');
    $('#selectKids-button').on('click', function () {
        var selectKid = $('#selectKids option:selected').val();
        console.log(selectKid);
        var startPeriod = $("#daterange").data('daterangepicker').startDate.format('YYYY-MM-DD');
        var endPeriod = $("#daterange").data('daterangepicker').endDate.format('YYYY-MM-DD');

        console.log(startPeriod);
        console.log(endPeriod);
        $table.bootstrapTable('destroy');
        $table.bootstrapTable({
            cache: false,
            method: "GET",
            datatype: "json",
            url: "admin-oerw/statistics-oerw.php",
            queryParams: function (p) {
                return {
                    childName: selectKid,
                    startPeriod: startPeriod,
                    endPeriod: endPeriod
                };
            },
            columns: [{
                field: 'resourceName',
                title: 'Terapeuta',
                sortable: true
            }, {
                field: 'passedEvents',
                title: 'Zajęcia nieodwołane',
                sortable: true
            }, {
                field: 'cancelEvents',
                title: 'Zajęcia odwołane',
                sortable: true
            }, {
                field: 'totalEvents',
                title: 'Wszystkie zajęcia',
                sortable: true
            }
            ]

        });
        document.getElementById("containerTable").style.display="block";
        document.getElementById("panelWithTableFooter").style.display="block";
        $("#panelWithTable").text(selectKid+", zakres od "+startPeriod+" do "+endPeriod );
        $("#panelWithTableFooter").text("Data sprawdzenia: "+moment().format('YYYY-MM-DD HH:mm:ss'));

    }),

    //$table.bootstrapTable({
    //       data: data1,
    //       columns: [{
    //           field: 'resourceName',
    //           title: 'Terapeuta',
    //           sortable: true
    //       },{
    //           field: 'passedEvents',
    //           title: 'Zajęcia wykonane',
    //           sortable: true
    //       },{
    //           field: 'cancelEvents',
    //           title: 'Zajęcia odwołane',
    //           sortable: true
    //       }
    //       ]
    //
    //   });



    //click event to show modal window
    $addChildButton.on('click', function () {


        $('#createChildModal').find('form')[0].reset();
        $('#createChildModal').modal('show');

        //simple validation for title, just diable submit button if title is empty
        $submitButton.prop('disabled', true);
        $('#lastName').keyup(function () {
            $submitButton.prop('disabled', this.value == "" ? true : false);
        });

        $submitButton.off('click');
        //click submit button to add new child
        $submitButton.on('click', function (e) {
            e.preventDefault();
            var firstname = $('#firstName').val();
            var lastname = $('#lastName').val();
            var groupName = $('#groupName').val();
            var test = checkIfChildExist(firstname, lastname, groupName);

            $('#lastName').keyup(function () {

                $('#kidExistsWarning').addClass('hidden');
            });
            //check if kid is already in DB
            if (test == 'exists') {
                $('#kidExistsWarning').removeClass('hidden');
                $submitButton.prop('disabled', true);

            }
            else {
                $.ajax({
                    cache: false,
                    type: "POST",
                    datatype: "json",
                    url: "admin-oerw/kidsAdd.php",
                    data: 'type=addKid' + '&firstName=' + firstname + '&lastName=' + lastname + '&groupName=' + groupName,
                    success: function () {
                        $('#createChildModal').modal('hide');
                        $table.bootstrapTable('refresh');

                    },
                    error: function () {
                        alert('Wystąpił następujący błąd przy sprawdzaniu bazy dzieci');
                    }

                });
            }

        });
    });
    //need add click support for cancel add child to clean formatting to default
    $('#cancelButton').on('click', function (e) {
        $('#submitButton').prop('disabled', false);
        $('#kidExistsWarning').addClass('hidden');


    });

//below will be needed to deal with actions like: delete and edit, this mainly has been taken from bootstrap-table example

    function operateFormatter(value, row, index) {
        return [
            '<button type="button" class="btn btn-warning  btn-sm" id="editChildButton">',
            '<span class="glyphicon glyphicon-pencil" aria-hidden="true" ></span>',
            '</button>  ',
            '  <button type="button" class="btn btn-danger  btn-sm" id="removeChilButton">',
            '<span class="glyphicon glyphicon-remove" aria-hidden="true" ></span>',
            '</button>',
        ].join('');
    }


});

//has to be outside document.ready
window.operateEvents = {
    'click #editChildButton': function (e, value, row, index) {
        $('#editChildModal').modal('show');
        $('#editfirstName').val(row.firstname);
        $('#editlastName').val(row.lastname);
        $('#editgroupName').val(row.groupName);
        $('#editSubmitButton').off('click');
        //click submit button to edit child
        $('#editSubmitButton').on('click', function (e) {
            e.preventDefault();
            var firstname = $('#editfirstName').val();
            var lastname = $('#editlastName').val();
            var groupName = $('#editgroupName').val();

            var test = checkIfChildExist(firstname, lastname);

            $('#editlastName').keyup(function () {

                $('#kidExistsWarningEdit').addClass('hidden');
                $('#editSubmitButton').prop('disabled', false);
            });
            //check if kid is already in DB
            if (test == 'exists') {
                $('#kidExistsWarningEdit').removeClass('hidden');
                $('#editSubmitButton').prop('disabled', true);

            }
            else
            {

                $.ajax({
                    cache: false,
                    type: "POST",
                    datatype: "json",
                    url: "admin-oerw/kidsAdd.php",
                    data: 'type=editkid' + '&firstname=' + firstname + '&lastname=' + lastname + '&groupName=' + groupName + '&ID=' + row.child_id + '&oldfirstname=' + row.firstname + '&oldlastname=' + row.lastname + '&oldgroupName=' + row.groupName,
                    success: function () {
                        $('#editChildModal').modal('hide');
                        $('#kidsTable').bootstrapTable('refresh');

                    },
                    error: function () {
                        alert('Wystąpił następujący błąd przy sprawdzaniu bazy terapeutów');
                    }

                });

        }


        });

        //need add click support for cancel edit to clean formatting to default
        $('#editCanceltButton').on('click', function (e) {
            $('#editSubmitButton').prop('disabled', false);
            $('#kidExistsWarningEdit').addClass('hidden');

        });


    },
    'click #removeChilButton': function (e, value, row, index) {
        $table.bootstrapTable('remove', {
            field: 'id',
            values: [row.id]
        });
    }
};