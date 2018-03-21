/**
 * Created by Sz on 2015-08-11.
 */

//global function for checking if resource exists, part of validation
function checkIfResourceExist(name){
    var result = null;
    $.ajax({
        cache: false,
        type: "POST",
        datatype: "json",
        url: "admin-oerw/resourceAdd.php",
        //async: false, danger, don't know what how it will dangerous!!!!!
        async: false,
        data: 'type=checkIfExist'+'&name='+name,
        success: function (response) {
            //looking for string "exists", which means that value exists
            result = jQuery.parseJSON(response);

        },
        error: function (e) {
            alert('Wystąpił następujący błąd przy sprawdzaniu bazy terapeutów' + e.responseText);
        }

    });
    //give back checking results
    return result;

}
//global function for count events for this resource, part of warning message
function checkEventsResource(resourceid){
    var result = null;
    $.ajax({
        cache: false,
        type: "POST",
        datatype: "json",
        url: "admin-oerw/resourceAdd.php",
        //async: false, danger, don't know what how it will dangerous!!!!!
        async: false,
        data: 'type=checkResourceEvents'+'&resourceid='+ resourceid,
        success: function (response) {
            //looking for string "exists", which means that value exists
            result = jQuery.parseJSON(response);

        },
        error: function (e) {
            alert('Wystąpił następujący błąd przy sprawdzaniu bazy terapeutów' + e.responseText);
        }

    });
    //give back checking results
    return result;

}
$(document).ready(function() {

    var $table = $('#resourceTable');
    var $addResourceButton = $('#addResourceButton');
    var $submitAddResourceButton = $('#submitAddResourceButton');



      $table.bootstrapTable({
           url: 'admin-oerw/resourceManage.php',
           columns: [{
               field: 'resourceid',
               title: 'ID',
               sortable: false
           },{
               field: 'sortID',
               title: 'Kolejność',
               sortable: true
            },{
               field: 'name',
               title: 'Imię i nazwisko',
               sortable: true
           }, {
               field: 'workingDays',
               title: 'Days',
               align: 'center'
           }, {
               field: 'action',
               title: 'Akcja',
               align: 'center',
               events: operateEvents,
               formatter: operateFormatter
               }]

       });
    /*******************************************************************************************************************
     * we don't want to see columns working days and id
     *
     ******************************************************************************************************************/
    $table.bootstrapTable('hideColumn', 'workingDays');
    $table.bootstrapTable('hideColumn', 'resourceid');


    /*******************************************************************************************************************
     * click add new resource
     *
     ******************************************************************************************************************/
    $addResourceButton.on('click', function () {

        //find and clear form, before modal show
        $('#createResourceModal').find('form')[0].reset();
        $('#createResourceModal').modal('show');

        //simple validation for title, just diable submit button if title is empty
        $submitAddResourceButton.prop('disabled', true);
        $('#name').keyup(function () {
            $submitAddResourceButton.prop('disabled', this.value == "" ? true : false);
        });

        $submitAddResourceButton.off('click');
        //click submit button to add new child
        $submitAddResourceButton.on('click', function (e) {
            e.preventDefault();
            var name = $('#name').val();
            var resourceSort = $('#resourceSort').val();
            var test = checkIfResourceExist(name);

            $('#name').keyup(function () {

                $('#resourceExistsWarning').addClass('hidden');
            });
            //check if kid is already in DB
            if (test == 'exists') {
                $('#resourceExistsWarning').removeClass('hidden');
                $submitAddResourceButton.prop('disabled', true);

            }
            else {
                $.ajax({
                    cache: false,
                    type: "POST",
                    datatype: "json",
                    url: "admin-oerw/resourceAdd.php",
                    data: 'type=addResource' + '&name=' + name + '&resourceSort=' +resourceSort,
                    success: function () {
                        $('#createResourceModal').modal('hide');
                        $table.bootstrapTable('refresh');

                    },
                    error: function () {
                        alert('Wystąpił następujący błąd przy sprawdzaniu bazy terapeutów');
                    }

                });
            }

        });
    });
//below will be needed to deal with actions like: delete and edit, this mainly has been taken from bootstrap-table example

    function operateFormatter(value, row, index) {
        return [
            '<button type="button" class="btn btn-warning  btn-sm" id="editResourceButton">',
            '<span class="glyphicon glyphicon-pencil" aria-hidden="true" ></span>',
            '</button>  ',
            '  <button type="button" class="btn btn-danger  btn-sm" id="removeResourceButton">',
            '<span class="glyphicon glyphicon-remove" aria-hidden="true" ></span>',
            '</button>',
            '  <button type="button" class="btn btn-success  btn-sm" id="workingDaysResourceButton" >',
            '<span class="glyphicon glyphicon-time" aria-hidden="true" ></span>',
            '</button>',
        ].join('');
    }
});

//has to be outside document.ready
window.operateEvents = {
    /*******************************************************************************************************************
     * click edit existing resource
     *
     ******************************************************************************************************************/
    'click #editResourceButton': function (e, value, row, index) {
        var old_sortID =  $('#editName').val(row.name);
        $('#editResourceModal').modal('show');
        $('#editName').val(row.name);
        $('#editSort').val(row.sortID);

        //submit button disbaled if no change in name input
        $('#editResourceSubmitButton').prop('disabled', true);
        $('input').change(function () {
            $('#editResourceSubmitButton').prop('disabled', this.value == '' ? true : false);
        });

        $('#editResourceSubmitButton').off('click');
        //click submit button to edit resource
        $('#editResourceSubmitButton').on('click', function (e) {
            e.preventDefault();
            var name = $('#editName').val();
            var sortID = $('#editSort').val();
            var test = checkIfResourceExist(name);
            //if resource exists , warning is shown
            if (test == 'exists' && old_sortID == sortID) {
                $('#resourceEditExistsWarning').removeClass('hidden');
                $('#editResourceSubmitButton').prop('disabled', true);

            }
            else {
                $.ajax({
                    cache: false,
                    type: "POST",
                    datatype: "json",
                    url: "admin-oerw/resourceAdd.php",
                    data: 'type=editResource' + '&name=' + name + '&resourceid=' + row.resourceid + '&sortID=' + sortID,
                    success: function () {
                        $('#editResourceModal').modal('hide');
                        $('#resourceTable').bootstrapTable('refresh');

                    },
                    error: function () {
                        alert('Wystąpił następujący błąd przy sprawdzaniu bazy terapeutów');
                    }

                });
            }



        })



    },
    /*******************************************************************************************************************
     * click delete existing resource
     *
     ******************************************************************************************************************/
    'click #removeResourceButton': function (e, value, row, index) {

        var eventCount = checkEventsResource(row.resourceid);
        if (eventCount != 0) {
            $('#resourceDeleteExistsWarning').removeClass('hidden');

        }
        $("label[for='eventCountLabel']").html("<strong>" + eventCount + "</strong>");

        $('#deleteResourceModal').modal('show');
        $('#deleteName').val(row.name);


        $('#deleteResourceSubmitButton').off('click');
        //click submit button to edit resource
        $('#deleteResourceSubmitButton').on('click', function (e) {
            e.preventDefault();

            $.ajax({
                cache: false,
                type: "POST",
                datatype: "json",
                url: "admin-oerw/process.php",
                data: 'type=deleteResource' + '&resourceid=' + row.resourceid,
                success: function () {
                    $('#deleteResourceModal').modal('hide');
                    $('#resourceTable').bootstrapTable('refresh');

                },
                error: function () {
                    alert('Wystąpił następujący błąd przy sprawdzaniu bazy terapeutów');
                }

            });
        })

    },
    'click #workingDaysResourceButton': function (e, value, row, index) {
        //get actual array of working days
        var ar = row.workingDays;
        //console.log(row.workingDays);
        //reset checkboxes to get fresh results from DB
        $('#workingDaysModal').find('form')[0].reset();

        //loop through array with working days and comapre with chackboxes values
        //TODO: is there possibility to write this better?
        for (var i = 0; i < ar.length; i++) {

            if ($('#monday').val() == ar[i])
            {
                $('input[name="monday"]').prop('checked', true);
            }
            if ($('#tuesday').val() == ar[i])
            {
                $('input[name="tuesday"]').prop('checked', true);
            }
            if ($('#wendsday').val() == ar[i])
            {
                $('input[name="wendsday"]').prop('checked', true);
            }
            if ($('#thursday').val() == ar[i])
            {
                $('input[name="thursday"]').prop('checked', true);
            }
            if ($('#friday').val() == ar[i])
            {
                $('input[name="friday"]').prop('checked', true);
            }

        }

        //
        $("label[for='workingDayLabel']").html("<strong>" + row.name + "</strong>");
        $('#workingDaysModal').modal('show');
        $('#workingDaysSubmitButton').off('click');
        //now when click submit on form
        $('#workingDaysSubmitButton').on('click', function (e) {
            e.preventDefault();
            var actualDays = [];
            $('#workingDaysModal input:checked').each(function() {
                actualDays.push(this.value);
            });
            console.log(actualDays);

            $.ajax({
                cache: false,
                type: "POST",
                datatype: "json",
                url: "admin-oerw/process.php",
                data: 'type=setWorkingdays' + '&resourceid=' + row.resourceid + '&workingDays=' + actualDays,
                success: function () {
                    $('#workingDaysModal').modal('hide');

                    $('#resourceTable').bootstrapTable('refresh', {
                        url: 'admin-oerw/resourceManage.php'
                    });

                },
                error: function () {
                    alert('Wystąpił następujący błąd przy sprawdzaniu bazy terapeutów');
                }

            });
        });


    }

};