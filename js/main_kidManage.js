/**
 * Created by Sz on 2015-08-11.
 */

function checkIfChildExist(firstname, lastname){
    var result = null;
    $.ajax({
        cache: false,
        type: "POST",
        datatype: "json",
        url: "admin/kidsAdd.php",
        //async: false, danger, don't know what how it will dangerous!!!!!
        async: false,
        data: 'type=checkIfExist'+'&firstName=' + firstname + '&lastName=' + lastname,
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
    document.getElementById('widget-container-child-details').style.display = 'none';
    var $table = $('#kidsTable');
    var child_id = $('#child-profile-id').val();
    var $documentsTable = $('#documentsTable');
    var $addChildButton = $('#addChildButton');
    var $submitButton = $('#submitButton');
    $('.input-mask-date').mask('9999-99-99',{placeholder:"rrrr-mm-dd"});
    $('.input-mask-phone').mask('999-999-999');
    $('.input-mask-id').mask('99999999999');

      $table.bootstrapTable({
           url: 'admin/kidsManage.php',
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
               field: 'status',
               title: 'Status',
               sortable: true,
               formatter: statusFormatter
           },{
               field: 'operate',
               title: 'Akcja',
               align: 'center',
               events: operateEvents,
               formatter: operateFormatter
           }]

       });
    $documentsTable.bootstrapTable({
        cache: false,
        method: "GET",
        datatype: "json",
        url: 'admin/documentsManage.php',
        queryParams: function (p) {
            return {
                child_id: $('#child-profile-id').text(),
            };
        },
        columns: [{
            field: 'document_id',
            title: 'ID',
            sortable: true,
            visible: false
        },{
            field: 'child_id',
            title: 'ID dziecka',
            sortable: true,
            visible: false
        }, {
            field: 'file_name',
            title: 'Nazwa pliku',
            sortable: true
        },{
            field: 'uploaded_by',
            title: 'Dodany przez',
            align: 'center',
            sortable: false,
            sortable: true
        },{
            field: 'uploaded',
            title: 'Data dodania',
            align: 'center',
            sortable: false,
            sortable: true
        },{
            field: 'operateDocs',
            title: 'Akcja',
            align: 'center',
            events: docOperateEvents,
            formatter: docOperateFormatter
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
            var city = $('#city').val();
            var street = $('#street').val();
            var phone = $('#phone').val();
            var email = $('#email').val();
            var birthday = $('#birthday').val();
            var teraphyStart = $('#teraphy-start').val();
            var teraphyEnd = $('#teraphy-end').val();
            var opinionNumber = $('#opinion-number').val();
            var idCard = $('#idCard').val();
            var test = checkIfChildExist(firstname, lastname);

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
                    url: "admin/kidsAdd.php",
                    data: 'type=addKid' + '&firstName=' + firstname + '&lastName=' + lastname + '&city=' + city + '&street=' + street + '&phone=' + phone +
                    '&email=' + email + '&birthday=' + birthday +'&teraphyStart=' + teraphyStart + '&teraphyEnd=' + teraphyEnd +
                    '&opinionNumber=' + opinionNumber + '&idCard=' + idCard,
                    success: function () {
                        $('#createChildModal').modal('hide');
                        $table.bootstrapTable('refresh');

                    },
                    error: function () {
                        alert('Wystąpił następujący błąd przy dodawaniu dziecka do bazy');
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

    function statusFormatter(value, row, index) {
        if (row.city==null||row.street==null||row.birthday==null||row.phone==null||row.email==null||row.teraphy_start==null||row.teraphy_start=='0000-00-00')
        {
            return [
                '<span class="label label-sm label-warning">uzupełnij dane</span>',
            ]

        }
        if(row.teraphy_end=='0000-00-00')
        {
            return [
                '<span class="label label-sm label-success">w terapii</span>',
            ]
        }
        if(row.teraphy_end!='0000-00-00')
        {
            return [
                '<span class="label label-sm label-danger">terapia zakończona</span>',
            ]
        }

    }
    function operateFormatter(value, row, index) {
        return [
            '<button type="button" class="btn btn-warning  btn-sm" id="editChildButton">',
            '<span class="glyphicon glyphicon-pencil" aria-hidden="true" ></span>',
            '</button>  ',
            '  <button type="button" class="btn btn-info  btn-sm" id="detailsChildButton">',
            '<span class="glyphicon glyphicon-zoom-in" aria-hidden="true" ></span>',
            '</button> ',
            '<button type="button" class="btn btn-danger btn-sm" id="deleteChildButton">',
            '<span class="glyphicon glyphicon-remove" aria-hidden="true" ></span>',
            '</button> ',

        ].join('');
    }

    function docOperateFormatter(value, row, index) {
        return [
            '<button type="button" class="btn btn-success  btn-sm" id="downloadButton">',
            '<span class="glyphicon glyphicon-download" aria-hidden="true" ></span>',
            '</button>  ',
            '<button type="button" class="btn btn-danger btn-sm" id="deleteDocButton">',
            '<span class="glyphicon glyphicon-remove" aria-hidden="true" ></span>',
            '</button> ',

        ].join('');
    }
    /*********************************************************
    * Initialize fileinput plugin
    *********************************************************/
    $("#input-file").fileinput({
        showCaption: true,
        showPreview: false,
        initialPreviewShowDelete: false,
        allowedFileExtensions:['doc','docx'],
        browseClass: 'btn btn-inverse btn-white',
        uploadClass: 'btn btn-inverse btn-white btn-primary',
        removeClass: 'btn btn-inverse btn-white btn-danger',
        showCancel: false,
        language: 'pl',
        uploadUrl: 'admin/upload.php',
        uploadAsync: true,
        uploadExtraData: function(){
            var child_id = $('#child-profile-id').text();
            var username = Cookies.get('username');
            var out = {};
            out["id"] = child_id;
            out["username"] = username;
            return out;
        },
});

    $('#input-file').on('filepreupload', function(event, data, previewId, index) {
        var form = data.form, files = data.files, extra = data.extra,
            response = data.response, reader = data.reader;
        console.log('File pre upload triggered'+$('#child-profile-id').text());
    });
    $('#input-file').on('fileuploaded', function(event, data, previewId, index) {
        var form = data.form, files = data.files, extra = data.extra,
            response = data.response, reader = data.reader;
        $('#documentsTable').bootstrapTable('refresh');
        $('#input-file').fileinput('clear');
        toastr["success"]("Dokument dodany do bazy");
    });
    $('#input-file').on('fileuploaderror', function(event, data, msg) {
        var form = data.form, files = data.files, extra = data.extra,
            response = data.response, reader = data.reader;
        console.log('File upload error');
        // get message
        toastr["error"](msg);
    });
});

//has to be outside document.ready
window.operateEvents = {
    'click #editChildButton': function (e, value, row, index) {
        $('#editChildModal').modal('show');
        $('#editfirstName').val(row.firstname);
        $('#editlastName').val(row.lastname);
        $('#editcity').val(row.city);
        $('#editstreet').val(row.street);
        $('#editphone').val(row.phone);
        $('#editemail').val(row.email);
        $('#editbirthday').val(row.birthday);
        $('#editteraphy-start').val(row.teraphy_start);
        $('#editteraphy-end').val(row.teraphy_end);
        $('#editopinion-number').val(row.opinion_number);
        $('#editSubmitButton').off('click');
        //click submit button to edit child
        $('#editSubmitButton').on('click', function (e) {
            e.preventDefault();
            var firstname = $('#editfirstName').val();
            var lastname = $('#editlastName').val();
            var city = $('#editcity').val();
            var street = $('#editstreet').val();
            var phone = $('#editphone').val();
            var email = $('#editemail').val();
            var birthday = $('#editbirthday').val();
            var teraphyStart = $('#editteraphy-start').val();
            var teraphyEnd = $('#editteraphy-end').val();
            var opinionNumber = $('#editopinion-number').val();

                $.ajax({
                    cache: false,
                    type: "POST",
                    datatype: "json",
                    url: "admin/kidsAdd.php",
                    data: 'type=editkid' + '&firstname=' + firstname + '&lastname=' + lastname + '&ID=' + row.child_id + '&oldfirstname=' + row.firstname + '&oldlastname=' + row.lastname+
                    '&city=' + city + '&street=' + street + '&phone=' + phone + '&email=' + email + '&birthday=' + birthday +'&teraphyStart=' + teraphyStart + '&teraphyEnd=' + teraphyEnd + '&opinionNumber=' + opinionNumber,
                    success: function () {
                        $('#editChildModal').modal('hide');
                        $('#kidsTable').bootstrapTable('refresh');

                    },
                    error: function () {
                        alert('Wystąpił następujący błąd przy sprawdzaniu bazy terapeutów');
                    }
                });
        });

        //need add click support for cancel edit to clean formatting to default
        $('#editCanceltButton').on('click', function (e) {
            $('#editSubmitButton').prop('disabled', false);
            $('#kidExistsWarningEdit').addClass('hidden');


        });


    },
    'click #detailsChildButton': function (e, value, row, index) {
        var username = Cookies.get('username');
        if (username ==undefined){

            $('#input-file').fileinput('disable');
        }else{
            $('#input-file').fileinput('enable');
        }
        var id = row.child_id;
        var name = row.firstname+' '+row.lastname;
        var address = row.city+', '+ row.street;
        var phone = row.phone;
        var birthday = row.birthday;
        var email = row.email;
        var teraphyStart = row.teraphy_start;
        var teraphyEnd = row.teraphy_end;
        $('#child-profile-id').text(id);
        $('#child-profile-name').text(name);
        $('#child-profile-address').text(address);
        $('#child-profile-birthday').text(birthday);
        $('#child-profile-phone').text(phone);
        $('#child-profile-email').text(email);
        $('#child-profile-therapy-start').text(teraphyStart);
        $('#child-profile-therapy-end').text(teraphyEnd);

        //console.log($('#child-profile-id').text());
        $('#documentsTable').bootstrapTable('refresh');
        $('#input-file').fileinput('refresh');
        $('#kidProfileWidget').text("Profil dziecka: "+name);
        document.getElementById('widget-container-child-details').style.display = 'block';
    },
    'click #deleteChildButton': function (e, value, row, index) {

        var child_id = row.child_id;
        var name = row.firstname+' '+row.lastname;
        $.ajax({
            cache: false,
            type: "POST",
            datatype: "json",
            url: "admin/kidsAdd.php",
            data: 'type=deletekid' + '&child_id=' + child_id,
            success: function () {
                toastr["success"](name + " usunięty/a z bazy");
                $('#kidsTable').bootstrapTable('refresh');

            },
            error: function () {
                toastr["error"]("Coś poszło nie tak, Nie mogę usunąć " + name);
            }
        });
    }
};
//has to be outside document.ready
window.docOperateEvents = {
    'click #downloadButton': function (e, value, row, index) {
        var file_name = row.file_name;
        console.log(file_name);
       window.location=('/admin/download.php?filename='+file_name);

    },
    'click #deleteDocButton': function (e, value, row, index) {
        var file_name = row.file_name;
        var child_id = row.child_id;
        $.ajax({
            cache: false,
            type: "POST",
            datatype: "json",
            url: "admin/kidsAdd.php",
            data: 'type=deletedocument&file_name=' + file_name + '&child_id=' + child_id,
            success: function () {
                toastr["success"](file_name + " usunięty z bazy");
                $('#documentsTable').bootstrapTable('refresh');

            },
            error: function () {
                toastr["error"]("Coś poszło nie tak, Nie mogę usunąć " + file_name);
            }
        });

    }

};
