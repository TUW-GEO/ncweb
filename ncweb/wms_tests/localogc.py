from os import path
from ogcserver.wsgi import WSGIApp


def startOgcServer(configfile, mapfile):
    '''
    
    :param configfile:
    :param mapfile:
    '''
    if not configfile:
        configfile = path.join('default.conf')
    if not mapfile:
        mapfile = path.join('map.xml')

    application = WSGIApp(configfile, mapfile)
    host = '0.0.0.0'
    port = 8000
    httpd = make_server(host, port, application)
    print "Listening at %s:%s...." % (host, port)
    httpd.serve_forever()

if __name__ == '__main__':
    from wsgiref.simple_server import make_server
    configfile = path.join('default.conf')
    mapfile = path.join('map.xml')
    startOgcServer(configfile, mapfile)
