from flask import Flask, url_for, render_template, request, jsonify
from flask_wtf import Form
from wtforms import SelectField
import os
import root_path as root
import netCDF4
import glob
from osgeo import gdal
import datetime
from owslib.wms import WebMapService
from thredds_crawler.crawl import Crawl
from urlparse import urlparse
import urllib2

class NetCdfForm(Form):
    variables = SelectField('variables', choices=[])
    files = SelectField('files', choices=[])


def convert2GTiff(netcdfile, outdir, VarName):
    '''

    :param netcdfile:
    :param outdir:
    :param VarName:
    '''

    try:
        nci = gdal.Open('NETCDF:{0}:{1}'.format(netcdfile, VarName))
        ncd = netCDF4.Dataset(netcdfile, format='NETCDF4')
    except:
        print "Could not open input file: {0}\n".format(netcdfile)
        return

    try:
        geotransform = nci.GetGeoTransform()
    except:
        print "Could not get geotransform.\n"
        return

    try:
        projection = nci.GetProjection()
    except:
        print "Could not get projection.\n"
        return

    numbands = nci.RasterCount
    print "Found {0} bands to process for {1}".format(numbands, VarName)
    for i in range(numbands):
        band = nci.GetRasterBand(i + 1)
        raster = band.ReadAsArray()
        y, x = raster.shape

        output_file = "{0}_{1}.tif".format(
            VarName, datetime.datetime.now().strftime('%Y%m%d_%H%M%S'))
        subdir = os.path.join(outdir, VarName)
        if not os.path.exists(subdir):
            os.mkdir(subdir)
        output_file = os.path.join(subdir, output_file)
        if os.path.exists(output_file):
            continue

        # Create GTiff
        driver = gdal.GetDriverByName("GTiff")

        dst_ds = driver.Create(output_file, x, y, 1, gdal.GDT_Int32)

        # top left x, w-e pixel resolution, rotation, top left y, rotation, n-s
        # pixel resolution
        dst_ds.SetGeoTransform(geotransform)
        # set the reference info
        dst_ds.SetProjection(projection)

        # print raster
        #
        # write the band
        outBand = dst_ds.GetRasterBand(1)
        outBand.WriteArray(raster)

        dst_ds = None


def readNetCDF(file):
    '''

    :param file:
    '''

    try:
        nc = netCDF4.Dataset(file, format='NETCDF4')
    except:
        print "Could not open input file: {0}".format(file)
        return

#     ari_arr = nc.variables['arid regions mask'][:, :]
#     print "arid regions mask:\n", ari_arr
#     lat_arr = nc.variables['lat']
#     lon_arr = nc.variables['lon']
#     topo_arr = nc.variables['topographic complexity'][:, :]
#     print 'topographic complexity:\n', topo_arr
#     trop_arr = nc.variables['tropical forest mask'][:, :]
#     print 'tropical forest mask:\n', trop_arr
#     wetland_arr = nc.variables['wetland fraction'][:, :]
#     print 'wetland fraction:\n', wetland_arr

    # allVars = ('arid regions mask', 'topographic complexity', 'tropical forest mask', 'wetland fraction')

    for var in nc.variables:
        try:
            if (nc.variables[var].grid_mapping == unicode('crs')
                    and nc.variables[var].dimensions == tuple([unicode('lat'), unicode('lon')])):
                # convert2GTiff(file, os.path.join("/home/pydev/GTiff"), str(var))
                pass
        except:
            continue

    i = 0
    variablechoices = []
    for variable in nc.variables:
        variablechoices.append((str(i), variable.encode('ascii', 'ignore')))
        i += 1

    return [file, nc, variablechoices]


app = Flask(__name__)


@app.route('/')
def index():
    form = NetCdfForm(csrf_enabled=False)
    path = os.path.join(root.x, "students", "mpoecht", "*.nc")

    netcdf_files = glob.glob(path)
    filechoices = []
    netcdfData = []
    allData = []
    j = 0
    for file in netcdf_files:
        data = readNetCDF(file)
        allData.append(data)
        filechoices.append((str(j), data[0]))
        netcdfData.append(data[1])
        j += 1
    pass
    form.files.choices = filechoices
    form.variables.choices = allData[0][2]
    # return netcdfData[0].dataset_name
    return render_template('netcdfData.html', form=form, netcdfData=netcdfData, allData=allData)


@app.route('/hello')
def hello():
    return 'Hello World'


def wmsRequest(req_url):
    '''
    Returns the WMS Response and the netcdf Variables for a requested url
    :param req_url:    WMS Request URL -
                        e.g. http://pydap-file-url.wms?REQUEST=GetCapabilities&SERVICE=WMS&VERSION=1.1.1'
    '''
    wmsData = WebMapService(req_url)

    i = 0
    variablechoices = []
    try:
        for variable in wmsData.contents:
            # Append the choice in a form, that the <select> option can handle
            # it (id, name, value)
            variablechoices.append(
                (str(i), variable.encode('ascii', 'ignore'), wmsData.contents[variable].title))
            i += 1
    except:
        pass

    return (wmsData, variablechoices)


def getTimepositions(wmsData, varName):
    '''
    Returns the timepositions of observations for a variable
    :param wmsData:    WMS Response
    :param varName:    Name of the variable
    '''
    try:
        return wmsData.contents[varName].timepositions
    except:
        return []


@app.route('/wmsold', methods=['GET', 'POST'])
def wmsIndex():
    try:
        req_url = request.form['wmsSelect']
        print(req_url)
    except:
        req_url = ""

    if request.method == 'POST' and req_url != "":
        wmsData, variablechoices = wmsRequest(request.form['wmsSelect'])
        if len(variablechoices) > 0:
            req_var = variablechoices[0][1]
            if request.form['changedCtrl'] != 'wmsSelect':
                try:
                    req_var = request.form['ncvarSelect']
                except:
                    req_var = variablechoices[0][1]
            timepositions = getTimepositions(wmsData, req_var)
            if timepositions and len(timepositions) > 0:
                req_time = timepositions[0]
                if request.form['changedCtrl'] not in ('wmsSelect', 'ncvarSelect'):
                    try:
                        req_time = request.form['timeSelect']
                    except:
                        req_time = timepositions[0]
            else:
                req_time = ""
        else:
            variablechoices = (
                0, 'noVarFound', 'WMS Response doesn\'t contain any variables')
            timepositions = []
            req_var = variablechoices[1]
            req_time = ""
        return render_template('wmsData.html', wmsData=wmsData,
                               nc_variables=variablechoices,
                               timepositions=timepositions,
                               req_url=req_url,
                               req_var=req_var,
                               req_time=req_time)

    return render_template('wmsData.html', req_url=req_url)


@app.route('/wms')
def wmsJS():
    return render_template('wmsDataJS.html')

@app.route('/wms/GetFileList', methods=['GET'])
def getFileList():

    url = request.args.get('url')
    print('URL: '+url)
    # url = "http://localhost:8080/thredds/catalog/testAll/catalog.html"
    c = Crawl(str(url))
    print c.datasets
    filelist = {}
    l = []

    for i in c.datasets:
        element = {}
        element['name'] = i.name
        l.append(element)
        print element


    parsed = urlparse(url)
    filelist['files'] = l
    filelist['root'] = parsed.scheme+'://'+parsed.netloc
    # filelist['location'] = filelist['root']+parsed.path.split('.',1)[0]+'/'
    filelist['location'] = filelist['root']+"/thredds/wms/testAll/"
    print filelist

    return jsonify(files=filelist['files'], location=filelist['location'])

@app.route('/love')
def marry():
    a = request.args.get('a')
    b = request.args.get('b')
    result = a+" is happily married to "+b
    # result = "Love is in the air with "+b
    # result = "Come on Bitches"
    return jsonify(results = result)


# run app
if __name__ == '__main__':

    # hostaddr = socket.gethostbyname(socket.gethostname())
    # local:
    # app.run(hostaddr, port=8082, debug=True)
    app.run(debug=True)
