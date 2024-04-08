<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="x-ua-compatible" content="ie=edge">

    <title>Landini | Starter</title>
    <link id="browser_favicon" rel="shortcut icon" href="dist/logo/logo.png">
    <link rel="stylesheet" href="dist/adminlte3/plugins/fontawesome-free/css/all.min.css">
    <link rel="stylesheet" href="dist/adminlte3/plugins/sweetalert2-theme-bootstrap-4/bootstrap-4.css">
    <link rel="stylesheet" href="dist/plugins/jstree/dist/themes/default/style.css" />
    <link rel="stylesheet" href="dist/adminlte3/dist/css/adminlte.min.css">
    <link rel="stylesheet" href="css/starter.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/jsoneditor/10.0.2/jsoneditor.css" integrity="sha512-iOFdnlwX6UGb55bU5DL0tjWkS/+9jxRxw2KiRzyHMZARASUSwm0nEXBcdqsYni+t3UKJSK7vrwvlL8792/UMjQ==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    <!-- <link href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,400i,700" rel="stylesheet"> -->
</head>

<body class="hold-transition sidebar-mini layout-navbar-fixed">
    <div class=" spinner-wrapper">
        <div class=" spinner">
            <div class=" bounce1"></div>
            <div class=" bounce2"></div>
            <div class=" bounce3"></div>
        </div>
    </div>
    <div class="wrapper">
        <nav class="main-header navbar navbar-expand navbar-white navbar-light">
            <ul class="navbar-nav">
                <li class="nav-item">
                    <a class="nav-link" data-widget="pushmenu" href="#" role="button"><i class="fas fa-bars"></i></a>
                </li>
                <li class="nav-item d-none d-sm-inline-block">
                    <a href="starter.php" class="nav-link">Home</a>
                </li>
            </ul>
            <form class="form-inline ml-3">
                <div class="input-group input-group-sm">
                    <input class="form-control form-control-navbar search-value" type="search" placeholder="Search" aria-label="Search">
                    <div class="input-group-append search-actions">
                        <button class="btn btn-navbar start-search" type="button">
                            <i class="fas fa-search"></i>
                        </button>
                        <button class="btn btn-navbar clear-search" type="button">
                            <i class="far fa-times-circle"></i>
                        </button>
                    </div>
                </div>
            </form>
            <ul class="navbar-nav ml-auto actions-nav">
                <button type="button" class="btn btn-danger btn-xs makeproject"><i class="fa fa-magic"></i> make-it!</button>
                <button type="button" class="btn btn-warning btn-xs newproject"> new project</button>
                <button type="button" class="btn btn-success btn-xs saveproject">save project</button>
            </ul>
        </nav>
        <aside class="main-sidebar sidebar-dark-primary elevation-4">
            <a href="#" class="brand-link">
                <span class="brand-text font-weight-light">Landini</span>
            </a>
            <div class="sidebar">
                <div class="user-panel mt-3 pb-3 mb-3 d-flex">
                    <div class="image">
                        <img src="dist/logo/Face.png" class="img-circle elevation-2" alt="User Image">
                    </div>
                    <div class="info">
                        <a href="#" class="d-block">Alejandro Landini</a>
                    </div>
                </div>

                <nav class="mt-2">
                    <ul class="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu" data-accordion="false">
                    </ul>
                </nav>
            </div>
        </aside>
        <div class="content-wrapper">
            <div class="content-header">
                <div class="container-fluid">
                    <div class="row mb-2">
                        <div class="col-sm-6">
                            <h1 class="m-0 text-dark">Project Page</h1>
                        </div>
                        <div class="col-sm-6">
                            <ol class="breadcrumb float-sm-right">
                                <li class="breadcrumb-item"><a href="starter.php">Home</a></li>
                                <li class="breadcrumb-item active">Project Page</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
            <div class="content">
                <div class="container-fluid">
                    <div class="col card card-outline card-starter">

                    </div>
                </div>
            </div>
        </div>
        <footer class="main-footer">
            <div class="float-right d-none d-sm-inline">
                Simple php project generator
            </div>
            <strong>Generation 2020 </strong> version <span class="starter-version"></span>
        </footer>
    </div>
    <script src="dist/adminlte3/plugins/jquery/jquery.min.js"></script>
    <script src="dist/adminlte3/plugins/bootstrap/js/bootstrap.bundle.min.js"></script>
    <script src="dist/adminlte3/plugins/jquery-validation/jquery.validate.min.js"></script>
    <script src="dist/adminlte3/plugins/jquery-validation/additional-methods.min.js"></script>
    <script src="dist/adminlte3/plugins/sweetalert2/sweetalert2.all.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jsoneditor/10.0.2/jsoneditor.min.js" integrity="sha512-QoEa+2J/Sie4bjZNs546qH2o7pK246K7bPYqMOkIU2J7Hdj6axTsPqYbbr0SgQ7iSAomOSa922z+z6yNbECGJQ==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <!-- <script src="dist/adminlte3/plugins/codemirror/codemirror.js"></script>
    <script src="dist/adminlte3/plugins/codemirror/mode"></script> -->

    <script src="dist/adminlte3/dist/js/adminlte.min.js"></script>

    <script src="dist/plugins/handlebars.js-4.7.6/handlebars-v4.7.6.js"></script>
    <script src="dist/plugins/jstree/dist/jstree.js"></script>
    <script src="dist/plugins/hotkeys/hotkeys.js"></script>
    <script src="js/common.js"></script>
    <script src="js/starter.js"></script>
</body>

</html>