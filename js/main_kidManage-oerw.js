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
$(document).ready(function() {

    var $table = $('#kidsTable');
    var $addChildButton = $('#addChildButton');
    var $submitButton = $('#submitButton');

        
      $table.bootstrapTable({
           url: 'admin-oerw/kidsManage.php',
           columns: [{
               field: 'child_id',
               title: 'ID',
               sortable: true
           },{
               field: 'firstname',
               title: 'Imię',
               sortable: true
           }, {
               field: 'lastname',
               title: 'Nazwisko',
               sortable: true
           },{
               field: 'groupName',
               title: 'Grupa',
               sortable: true
           },{
               field: 'operate',
               title: 'Akcja',
               align: 'center',
               events: operateEvents,
               formatter: operateFormatter
           }]

       });



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


})

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


        })

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